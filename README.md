# Infisical Token Action

This GitHub Actions gets an Infisical token from the cloud or self-hosted infisical instance and injects it into the env as `env.INFISICAL_TOKEN`

## Configuration

- In order to use this, you will need to configure a [Machine Identity](https://infisical.com/docs/documentation/platform/identities/machine-identities) for your project.
- This action supports three ways to authenticate your workflows with Infisical - [AWS IAM Auth](https://infisical.com/docs/documentation/platform/identities/aws-auth), [OIDC](https://infisical.com/docs/documentation/platform/identities/oidc-auth/github) and [universal auth](https://infisical.com/docs/documentation/platform/identities/universal-auth).

### AWS IAM Auth

- Configure a machine identity to use the "AWS Auth" method. Set the allowed principal ARNs, account IDs, and other settings as needed for your setup. Refer to the setup guide [here](https://infisical.com/docs/documentation/platform/identities/aws-auth).
- Get the machine identity's ID.
- Set `method` to aws-iam and configure the `identity-id` input parameter.
- Your GitHub Action runner must have access to AWS credentials (either through IAM roles, environment variables, or other AWS credential providers).
- Ensure your runner has network access to AWS STS API endpoints.

```yaml
- uses: Rikthepixel/infisical-token-action@v1.0.1
  with:
    method: "aws-iam"
    identity-id: "24be0d94-b43a-41c4-812c-1e8654d9ce1e"
    domain: "https://app.infisical.com" # Update to the instance URL when using EU (https://eu.infisical.com), a dedicated instance, or a self-hosted instance
```

### OIDC Auth

- Configure a machine identity to use the "OIDC Auth" method. Set the bound audience, bound subject, and bound claims as needed for your setup. Refer to the setup guide [here](https://infisical.com/docs/documentation/platform/identities/oidc-auth/github).
- Get the machine identity's ID.
- Set `method` to oidc and configure the `identity-id` input parameter. Optionally, customize the JWT's aud field by setting the `oidc-audience` input parameter.
- For debugging OIDC configuration issues, you can use GitHub's [actions-oidc-debugger](https://github.com/github/actions-oidc-debugger) tool. This tool helps you inspect the JWT claims and verify they match your configuration.
- Add `id-token: write` to the permissions for your workflow:
```
permissions:
  id-token: write
  contents: read
```

### Universal Auth

- Configure a machine identity to have an auth method of "Universal Auth".
- Get the machine identity's `client_id` and `client_secret` and store them as Github secrets (recommended) or environment variables.
- Set the `client-id` and `client-secret` input parameters.

## Usage

With this action, you can use your Infisical secrets in two ways: as environment variables or as a file.

### As environment variables

Secrets are injected as environment variables and can be referenced by subsequent workflow steps.

```yaml
- uses: Rikthepixel/infisical-token-action@v1.0.1
  with:
    method: "oidc"
    identity-id: "24be0d94-b43a-41c4-812c-1e8654d9ce1e"
    domain: "https://app.infisical.com" # Update to the instance URL when using EU (https://eu.infisical.com), a dedicated instance, or a self-hosted instance
- name: Example
  run: echo "${{ env.INFISICAL_TOKEN }}"
```

## Inputs

### `method`

**Optional**. The authentication method to use. Defaults to `universal`. Possible values are `universal`, `oidc`, and `aws-iam`

### `client-id`

**Optional**. Machine Identity client ID

### `client-secret`

**Optional**. Machine Identity secret key

### `identity-id`

**Optional**. Machine Identity ID

### `oidc-audience`

**Optional**. Custom aud claim for the signed Github ID token

### `domain`

**Optional**. Infisical URL. Defaults to https://app.infisical.com. If you're using Infisical EU (https://eu.infisical.com) or a self-hosted/dedicated instance, you will need to set the appropriate value for this field.

### `extra-headers`

**Optional**. You can optionally provide extra headers that will be included in every request made to Infisical. This is useful if your Infisical instance is behind a header-based firewall.

Example:

```yaml
extra-headers: |
    Example-Header: Header-Value
    X-Request-Id: 1234567890
    X-Authentication-Secret: ${{ secrets.AUTH_SECRET }}
```

## Credit

All credit goes to the Infisical team for creating the [infisical/secrets-action](https://github.com/Infisical/secrets-action). This is simply a fork that has been modified to fit my needs.
