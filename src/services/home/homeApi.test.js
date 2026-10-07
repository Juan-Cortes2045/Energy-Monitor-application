import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../http/httpClient", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { httpClient } from "../http/httpClient";
import * as api from "./homeApi";

beforeEach(() => vi.clearAllMocks());

describe("homeApi", () => {
  it("createHome POST /homes", async () => {
    httpClient.post.mockResolvedValue({ data: { idHome: "1" } });
    const body = { name: "Casa", homeTypeId: "t1", address: "Calle 1 #2" };
    const res = await api.createHome(body);
    expect(httpClient.post).toHaveBeenCalledWith("/homes", body);
    expect(res).toEqual({ idHome: "1" });
  });

  it("listHomes GET /homes", async () => {
    httpClient.get.mockResolvedValue({ data: [] });
    await api.listHomes();
    expect(httpClient.get).toHaveBeenCalledWith("/homes");
  });

  it("joinHome POST /homes/join", async () => {
    httpClient.post.mockResolvedValue({ data: {} });
    await api.joinHome({ accessCode: "ABC12345" });
    expect(httpClient.post).toHaveBeenCalledWith("/homes/join", { accessCode: "ABC12345" });
  });

  it("toggleFavorite PUT /homes/{id}/favorite", async () => {
    httpClient.put.mockResolvedValue({ data: {} });
    await api.toggleFavorite("h1");
    expect(httpClient.put).toHaveBeenCalledWith("/homes/h1/favorite");
  });

  it("removeMember DELETE .../members/{userId}", async () => {
    httpClient.delete.mockResolvedValue({});
    await api.removeMember("h1", "u2");
    expect(httpClient.delete).toHaveBeenCalledWith("/homes/h1/members/u2");
  });

  it("listMembers GET .../members", async () => {
    httpClient.get.mockResolvedValue({ data: [{ userId: "u2", homeId: "h1", role: "MEMBER", favorite: false }] });
    const res = await api.listMembers("h1");
    expect(httpClient.get).toHaveBeenCalledWith("/homes/h1/members");
    expect(res).toHaveLength(1);
    expect(res[0].role).toBe("MEMBER");
  });

  it("leaveHome DELETE .../members/me", async () => {
    httpClient.delete.mockResolvedValue({});
    await api.leaveHome("h1");
    expect(httpClient.delete).toHaveBeenCalledWith("/homes/h1/members/me");
  });

  it("getThresholds GET /homes/{id}/thresholds", async () => {
    httpClient.get.mockResolvedValue({ data: {} });
    await api.getThresholds("h1");
    expect(httpClient.get).toHaveBeenCalledWith("/homes/h1/thresholds");
  });

  it("updateThresholds PUT con body", async () => {
    httpClient.put.mockResolvedValue({ data: {} });
    await api.updateThresholds("h1", { dailyLimit: 10, monthlyLimit: 300 });
    expect(httpClient.put).toHaveBeenCalledWith("/homes/h1/thresholds", {
      dailyLimit: 10,
      monthlyLimit: 300,
    });
  });

  it("listHomeTypes GET /home-types", async () => {
    httpClient.get.mockResolvedValue({ data: [] });
    await api.listHomeTypes();
    expect(httpClient.get).toHaveBeenCalledWith("/home-types");
  });

  it("getHomeType GET /home-types/{id}", async () => {
    httpClient.get.mockResolvedValue({ data: {} });
    await api.getHomeType("t9");
    expect(httpClient.get).toHaveBeenCalledWith("/home-types/t9");
  });

  it("codifica ids en la ruta", async () => {
    httpClient.get.mockResolvedValue({ data: {} });
    await api.getThresholds("a/b");
    expect(httpClient.get).toHaveBeenCalledWith("/homes/a%2Fb/thresholds");
  });

  it("propaga errores del cliente", async () => {
    httpClient.get.mockRejectedValue(new Error("boom"));
    await expect(api.listHomes()).rejects.toThrow("boom");
  });
});
