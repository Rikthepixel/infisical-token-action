import core from "@actions/core";
import {
  UALogin,
  oidcLogin,
  awsIamLogin,
  createAxiosInstance,
} from "./infisical";
import { AuthMethod } from "./constants";

function parseHeadersInput(inputKey: string) {
  const rawHeadersString = core.getInput(inputKey) || "";

  const headerStrings = rawHeadersString
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const parsedHeaderStrings = headerStrings.reduce(
    (obj, line) => {
      const seperator = line.indexOf(":");
      const key = line.substring(0, seperator).trim().toLowerCase();
      const value = line.substring(seperator + 1).trim();
      if (obj[key]) {
        obj[key] = [obj[key], value].join(", ");
      } else {
        obj[key] = value;
      }
      return obj;
    },
    {} as Record<string, string>,
  );

  return parsedHeaderStrings;
}

const main = async () => {
  try {
    const method = core.getInput("method");
    const UAClientId = core.getInput("client-id");
    const UAClientSecret = core.getInput("client-secret");
    const identityId = core.getInput("identity-id");
    const oidcAudience = core.getInput("oidc-audience");
    const domain = core.getInput("domain");
    const extraHeaders = parseHeadersInput("extra-headers");

    // get infisical token using credentials
    let infisicalToken;

    const axiosInstance = createAxiosInstance(domain, extraHeaders);

    switch (method) {
      case AuthMethod.Universal: {
        if (!(UAClientId && UAClientSecret)) {
          throw new Error("Missing universal auth credentials");
        }
        infisicalToken = await UALogin({
          axiosInstance,
          clientId: UAClientId,
          clientSecret: UAClientSecret,
        });
        break;
      }
      case AuthMethod.Oidc: {
        if (!identityId) {
          throw new Error("Missing identity ID for OIDC auth");
        }
        infisicalToken = await oidcLogin({
          axiosInstance,
          identityId,
          oidcAudience,
        });
        break;
      }
      case AuthMethod.AwsIam: {
        if (!identityId) {
          throw new Error("Missing identity ID for AWS IAM auth");
        }
        infisicalToken = await awsIamLogin({
          axiosInstance,
          identityId,
        });
        break;
      }
      default:
        throw new Error(`Invalid authentication method: ${method}`);
    }

    core.setSecret(infisicalToken);
    core.exportVariable("INFISICAL_TOKEN", infisicalToken);

    core.info("Successfully set INFISICAL_TOKEN");
  } catch (err) {
    core.setFailed((err as Error)?.message);
  }
};

main();
