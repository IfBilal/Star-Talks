"""Disposable Star Talks Supabase smoke test; never prints credentials.

Requires SUPABASE_ACCESS_TOKEN with project API-key read permission. By default
this makes no OpenAI calls. --live permits exactly two AI generation actions:
one numerology reading and one pairwise compatibility analysis.
"""

import argparse
import hashlib
import json
import os
import secrets
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

REF = "thoknhjxmgsyisxuyamb"
BASE = f"https://{REF}.supabase.co"


def request(url, method="GET", data=None, headers=None, timeout=90):
    payload = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(
        url,
        data=payload,
        method=method,
        headers={"content-type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read()
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as error:
        body = error.read().decode()
        return error.code, json.loads(body) if body.startswith("{") else {"error": body[:300]}


def expect(label, actual, wanted, data=None):
    if actual != wanted:
        raise AssertionError(f"{label}: HTTP {actual}; expected {wanted}; {str(data)[:300]}")
    print(f"PASS {label}")


def main(live):
    token = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if not token:
        raise SystemExit("SUPABASE_ACCESS_TOKEN is required")
    status, keys = request(
        f"https://api.supabase.com/v1/projects/{REF}/api-keys?reveal=true",
        headers={"authorization": "Bearer " + token},
    )
    expect("project API access", status, 200)
    admin = next(key["api_key"] for key in keys if key.get("type") == "legacy" and key.get("name") == "service_role")
    public = next(key["api_key"] for key in keys if key.get("type") == "legacy" and key.get("name") == "anon")
    accounts = []
    uploaded_path = None

    def create_account():
        email = f"star-talks-m2-qa-{uuid.uuid4().hex[:12]}@example.com"
        password = secrets.token_urlsafe(28)
        status, user = request(
            BASE + "/auth/v1/admin/users", "POST",
            {"email": email, "password": password, "email_confirm": True, "user_metadata": {"test_account": True}},
            {"apikey": admin, "authorization": "Bearer " + admin},
        )
        expect("disposable signup", status, 200, user)
        accounts.append(user["id"])
        status, session = request(
            BASE + "/auth/v1/token?grant_type=password", "POST",
            {"email": email, "password": password}, {"apikey": public},
        )
        expect("disposable login", status, 200, session)
        return user["id"], session["access_token"]

    def rest(table, jwt, method="GET", data=None, query="", owner=False):
        key = admin if owner else public
        return request(
            BASE + "/rest/v1/" + table + query, method, data,
            {"apikey": key, "authorization": "Bearer " + (admin if owner else jwt), "Prefer": "return=representation"},
        )

    def ai(jwt, action):
        return request(
            BASE + "/functions/v1/ai", "POST", action,
            {"apikey": public, "authorization": "Bearer " + jwt},
        )

    def profile(user_id, jwt, name, relationship, birth_date):
        status, rows = rest(
            "birth_profiles", jwt, "POST",
            {
                "user_id": user_id, "display_name": name, "relationship": relationship,
                "birth_date": birth_date, "birth_time": "12:00:00", "birth_time_known": True,
                "birth_instant": birth_date + "T06:30:00Z", "place_label": "New Delhi, India",
                "latitude": 28.6139, "longitude": 77.209, "time_zone": "Asia/Kolkata",
                "numerology_name": name,
            },
        )
        expect("birth profile creation", status, 201, rows)
        return rows[0]["id"]

    try:
        first_id, first_jwt = create_account()
        second_id, second_jwt = create_account()
        for user_id, jwt, name in [(first_id, first_jwt, "Ada Smoke"), (second_id, second_jwt, "Sam Smoke")]:
            status, rows = rest("profiles", jwt, "POST", {"id": user_id, "display_name": name, "language_code": "en"})
            expect("account profile creation", status, 201, rows)
        first_profile = profile(first_id, first_jwt, "Ada Smoke", "self", "1995-05-15")
        second_profile = profile(second_id, second_jwt, "Sam Smoke", "self", "1992-02-02")
        partner_profile = profile(second_id, second_jwt, "Taylor Smoke", "partner", "1994-06-20")

        quota_id = str(uuid.uuid4())
        quota_args = {"p_user_id": first_id, "p_request_id": quota_id, "p_daily_limit": 1,
                      "p_fingerprint": hashlib.sha256(b"qa-quota").hexdigest(),
                      "p_global_daily_limit": 100, "p_user_minute_limit": 100,
                      "p_global_minute_limit": 100}
        status, granted = rest("rpc/claim_ai_preview_request", first_jwt, "POST", quota_args, owner=True)
        expect("first preview quota claim", status, 200, granted)
        assert granted is True
        status, replay = rest("rpc/claim_ai_preview_request", first_jwt, "POST", quota_args, owner=True)
        expect("quota request replay", status, 200, replay)
        assert replay is True
        status, refused = rest("rpc/claim_ai_preview_request", first_jwt, "POST", {**quota_args, "p_request_id": str(uuid.uuid4())}, owner=True)
        expect("quota cap response", status, 200, refused)
        assert refused is False
        print("PASS per-account quota cap with idempotent replay")

        status, foreign = rest("birth_profiles", second_jwt, query=f"?id=eq.{first_profile}&select=id")
        expect("cross-account profile read", status, 200, foreign)
        assert foreign == [], "Another account's profile was visible"
        print("PASS cross-account profile isolation")

        status, result = ai(first_jwt, {"action": "list-modules"})
        expect("module registry", status, 200, result)
        assert len(result["modules"]) == 9, "The module registry does not contain nine modules"
        print("PASS nine active modules")
        for jwt in [first_jwt, second_jwt]:
            status, result = ai(jwt, {"action": "accept-consent", "consentScope": "birth_and_questions"})
            expect("AI consent", status, 200, result)
            status, result = ai(jwt, {"action": "get-consent"})
            expect("AI consent retrieval", status, 200, result)
            assert result["accepted"]["birth_and_questions"] is True

        # The tarot first-reading route was already live-tested. This record
        # exercises deployed history/feedback routes without another AI call.
        status, records = rest(
            "ai_conversations", first_jwt, "POST",
            {
                "user_id": first_id, "module_id": "tarot", "title": "QA history fixture",
                "methodology_version": "qa-fixture", "prompt_version": "qa-fixture",
                "first_reading_status": "ready",
                "input_snapshot": {"moduleId": "tarot", "version": "qa-fixture", "warnings": [], "factors": [{"id": "card:qa", "value": "The Star"}]},
            }, owner=True,
        )
        expect("history fixture", status, 201, records)
        conversation_id = records[0]["id"]
        status, records = rest(
            "ai_messages", first_jwt, "POST",
            {"user_id": first_id, "conversation_id": conversation_id, "role": "assistant", "kind": "first", "body": "Synthetic reading for QA", "source_refs": ["card:qa"]},
            owner=True,
        )
        expect("message fixture", status, 201, records)
        message_id = records[0]["id"]
        status, result = ai(first_jwt, {"action": "get-conversation", "conversationId": conversation_id})
        expect("saved conversation retrieval", status, 200, result)
        assert len(result["messages"]) == 1
        status, result = ai(first_jwt, {"action": "submit-ai-feedback", "conversationId": conversation_id, "messageId": message_id, "helpful": False, "reasons": ["Too generic"]})
        expect("feedback save", status, 200, result)
        status, result = ai(first_jwt, {"action": "get-conversation", "conversationId": conversation_id})
        expect("feedback retrieval", status, 200, result)
        assert len(result["feedback"]) == 1
        status, result = ai(first_jwt, {"action": "rename-conversation", "conversationId": conversation_id, "title": "Renamed QA reading"})
        expect("history rename", status, 200, result)
        status, result = ai(first_jwt, {"action": "list-conversations", "search": "Renamed", "moduleFilter": "tarot"})
        expect("history search/filter", status, 200, result)
        assert len(result["conversations"]) == 1
        status, result = ai(second_jwt, {"action": "get-conversation", "conversationId": conversation_id})
        expect("cross-account AI history denial", status, 404, result)
        status, result = ai(first_jwt, {"action": "delete-conversation", "conversationId": conversation_id})
        expect("history delete", status, 200, result)

        status, result = ai(first_jwt, {"action": "accept-consent", "consentScope": "palm_image"})
        expect("image consent", status, 200, result)
        uploaded_path = first_id + "/qa-palm.png"
        image = Path("assets/images/star-talks-mark.png").read_bytes()
        upload = urllib.request.Request(
            BASE + "/storage/v1/object/ai-private/" + uploaded_path,
            data=image, method="POST",
            headers={"content-type": "image/png", "apikey": public, "authorization": "Bearer " + first_jwt},
        )
        try:
            with urllib.request.urlopen(upload, timeout=30) as response:
                expect("private image upload", response.status, 200)
        except urllib.error.HTTPError as error:
            raise AssertionError(f"private image upload HTTP {error.code}: {error.read().decode()[:250]}") from error
        foreign_image = urllib.request.Request(
            BASE + "/storage/v1/object/ai-private/" + uploaded_path,
            headers={"apikey": public, "authorization": "Bearer " + second_jwt},
        )
        try:
            with urllib.request.urlopen(foreign_image, timeout=15):
                raise AssertionError("Another account downloaded the private photo")
        except urllib.error.HTTPError as error:
            assert error.code in (400, 401, 403, 404), f"Unexpected private image response {error.code}"
            print("PASS cross-account private image denial")
        status, media = rest("ai_media", first_jwt, "POST", {
            "user_id": first_id, "kind": "palm", "storage_path": uploaded_path,
            "mime_type": "image/png", "consent_at": datetime.now(timezone.utc).isoformat(),
        })
        expect("private photo metadata", status, 201, media)
        status, photo_chat = rest("ai_conversations", first_jwt, "POST", {
            "user_id": first_id, "module_id": "palmistry", "title": "QA photo fixture",
            "methodology_version": "qa-fixture", "prompt_version": "qa-fixture",
            "first_reading_status": "ready",
            "input_snapshot": {"moduleId": "palmistry", "version": "qa-fixture", "mediaId": media[0]["id"], "warnings": [], "factors": []},
        }, owner=True)
        expect("photo reading fixture", status, 201, photo_chat)
        status, result = ai(first_jwt, {"action": "delete-reading-photo", "conversationId": photo_chat[0]["id"]})
        expect("photo deletion through AI API", status, 200, result)
        uploaded_path = None
        status, photos = rest("ai_media", first_jwt, query=f"?id=eq.{media[0]['id']}&select=id")
        expect("photo metadata gone", status, 200, photos)
        assert photos == []

        if live:
            # Exactly two generation actions; errors are reported without retry.
            status, result = ai(first_jwt, {"action": "start-reading", "moduleId": "numerology", "profileId": first_profile, "requestId": str(uuid.uuid4())})
            expect("live numerology reading", status, 200, result)
            assert result["messages"][0]["source_refs"]
            print("PASS live numerology evidence")
            status, result = ai(second_jwt, {"action": "analyze-compatibility", "firstProfileId": second_profile, "secondProfileId": partner_profile, "method": "tarot", "relationshipType": "friendship", "requestId": str(uuid.uuid4())})
            expect("live pairwise compatibility", status, 200, result)
            analysis_id = result["analysis"]["id"]
            assert result["analysis"]["result"]["score"] is None, "Tarot invented a compatibility percentage"
            status, result = ai(second_jwt, {"action": "get-compatibility", "analysisId": analysis_id})
            expect("saved compatibility retrieval", status, 200, result)
            assert result["stale"] is False
            status, result = ai(second_jwt, {"action": "open-compatibility-chat", "analysisId": analysis_id})
            expect("linked compatibility chat", status, 200, result)
            linked_id = result["conversation"]["id"]
            status, result = ai(second_jwt, {"action": "get-conversation", "conversationId": linked_id})
            expect("linked compatibility message", status, 200, result)
            assert len(result["messages"]) == 1

        status, result = ai(first_jwt, {"action": "delete-all-ai-history", "confirmation": "DELETE"})
        expect("bulk AI history deletion", status, 200, result)
        status, result = request(BASE + "/functions/v1/delete-account", "POST", {"confirmation": "DELETE ACCOUNT"}, {"apikey": public, "authorization": "Bearer " + second_jwt})
        expect("self-service account deletion", status, 200, result)
        accounts.remove(second_id)
        print("PASS self-service account removed")
    finally:
        if uploaded_path:
            request(BASE + "/storage/v1/object/ai-private/" + uploaded_path, "DELETE", headers={"apikey": admin, "authorization": "Bearer " + admin})
        for user_id in accounts:
            status, _ = request(BASE + "/auth/v1/admin/users/" + user_id, "DELETE", headers={"apikey": admin, "authorization": "Bearer " + admin})
            print("PASS disposable account cleanup" if status in (200, 204) else f"FAIL disposable account cleanup HTTP {status}")


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("--live", action="store_true", help="Permit at most two paid AI generation actions")
    main(args.parse_args().live)
