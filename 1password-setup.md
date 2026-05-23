# 1Password 整合設定指南

本專案使用 [1Password GitHub Actions](https://developer.1password.com/docs/ci-cd/github-actions/) 管理所有 CI/CD 秘密，避免將 API 金鑰直接存入 GitHub Secrets。

---

## 架構說明

```
1Password Vault: "Code-Reviewer"
├── Claude API
│   └── api_key      → ANTHROPIC_API_KEY
└── GitHub Token
    └── token        → GITHUB_TOKEN_1P（備用）
```

GitHub Secrets 中只需存放一個值：
- `OP_SERVICE_ACCOUNT_TOKEN` — 1Password 服務帳戶 token

---

## 設定步驟

### 步驟 1：在 1Password 建立 Vault

1. 登入 1Password，建立一個名為 **`Code-Reviewer`** 的新 Vault
2. 在 Vault 中新增以下項目：

| 項目名稱 | 欄位名稱 | 值 |
|---------|---------|-----|
| `Claude API` | `api_key` | 你的 Anthropic API 金鑰 |
| `GitHub Token` | `token` | 你的 GitHub Personal Access Token（選用） |

### 步驟 2：建立 1Password 服務帳戶

1. 前往 1Password → **整合** → **服務帳戶**
2. 建立新服務帳戶，命名為 `github-actions`
3. 授予它對 `Code-Reviewer` Vault 的**讀取**權限
4. 複製產生的服務帳戶 token

### 步驟 3：將 token 加入 GitHub Secrets

1. 前往 GitHub Repo → **Settings** → **Secrets and variables** → **Actions**
2. 新增 Repository Secret：
   - 名稱：`OP_SERVICE_ACCOUNT_TOKEN`
   - 值：貼上步驟 2 取得的服務帳戶 token

---

## 工作流程中的使用方式

每個工作流程都會在開頭載入 1Password 秘密：

```yaml
- name: Load secrets from 1Password
  uses: 1password/load-secrets-action@v2
  with:
    export-env: true
  env:
    OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
    ANTHROPIC_API_KEY: op://Code-Reviewer/Claude API/api_key
```

格式說明：`op://Vault名稱/項目名稱/欄位名稱`

---

## 已整合的工作流程

| 工作流程 | 使用的秘密 | 說明 |
|---------|-----------|------|
| `weekly-review.yml` | `ANTHROPIC_API_KEY` | 每週自動回顧 |
| `monthly-prune.yml` | `ANTHROPIC_API_KEY` | 每月清理舊記錄 |
| `pr-code-review.yml` | `ANTHROPIC_API_KEY` | PR 開啟時自動 AI 審查 |

---

## 安全優勢

- ✅ API 金鑰只存在 1Password，不存入任何 Git 記錄
- ✅ GitHub Secrets 只需一個 token（服務帳戶）
- ✅ 可隨時在 1Password 中輪換金鑰，無需修改任何 GitHub 設定
- ✅ 完整的存取稽核記錄由 1Password 提供
