const { LicenseChainClient } = require("../dist/index.js");

describe("HWUID hash spec", () => {
  test("default hwuid is deterministic lowercase sha256 hex", () => {
    const client = LicenseChainClient.create("test-api-key");
    const h1 = client.defaultHwuid();
    const h2 = client.defaultHwuid();

    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });
});
