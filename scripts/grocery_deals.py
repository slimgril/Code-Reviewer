#!/usr/bin/env python3
"""Search Perplexity for today's PX Mart (全聯) and Carrefour (家樂福) Taiwan
deals/promotions and email a summary to the configured recipient."""
import os
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText

import requests

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
RECIPIENT_EMAIL = "wangjohnsonwt@gmail.com"
TAIWAN_TZ = timezone(timedelta(hours=8))


def fetch_deals(api_key, date_str):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    prompt = (
        f"請搜尋並整理台灣「全聯福利中心」與「家樂福」目前（{date_str}前後）"
        "進行中的優惠活動、特價商品與促銷資訊。請依下列格式整理：\n\n"
        "1. 全聯福利中心\n"
        "- 活動名稱與期間\n"
        "- 特價商品清單（商品名稱、原價、特價）\n"
        "- 其他優惠（會員日、滿額贈、coupon 等）\n\n"
        "2. 家樂福\n"
        "- 活動名稱與期間\n"
        "- 特價商品清單（商品名稱、原價、特價）\n"
        "- 其他優惠（會員日、滿額贈、coupon 等）\n\n"
        "請使用繁體中文回覆，純文字格式（不要使用 # 或 * 等 Markdown 符號），"
        "條列清晰易讀。若找不到當天的資訊，請提供你能找到的最新一週優惠資訊。"
    )
    payload = {
        "model": "sonar-pro",
        "messages": [
            {
                "role": "system",
                "content": "你是一個專門整理台灣超市優惠資訊的助理。",
            },
            {"role": "user", "content": prompt},
        ],
    }
    response = requests.post(PERPLEXITY_API_URL, headers=headers, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def send_email(subject, body):
    smtp_host = os.environ["SMTP_HOST"]
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ["SMTP_USERNAME"]
    smtp_password = os.environ["SMTP_PASSWORD"]

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = RECIPIENT_EMAIL

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, [RECIPIENT_EMAIL], msg.as_string())


def main():
    api_key = os.environ["PERPLEXITY_API_KEY"]
    today = datetime.now(TAIWAN_TZ).strftime("%Y-%m-%d")

    deals = fetch_deals(api_key, today)
    subject = f"全聯 / 家樂福 今日優惠整理 - {today}"
    send_email(subject, deals)
    print(f"Email sent to {RECIPIENT_EMAIL} for {today}")


if __name__ == "__main__":
    main()
