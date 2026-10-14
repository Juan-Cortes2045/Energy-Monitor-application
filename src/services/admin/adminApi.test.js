import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../http/httpClient", () => ({
  httpClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { httpClient } from "../http/httpClient";
import * as api from "./adminApi";

beforeEach(() => vi.clearAllMocks());

describe("adminApi", () => {
  it("listUsers GET /admin/users con búsqueda y página", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [], totalItems: 0 } });
    await api.listUsers({ q: "  ada ", page: 2, size: 10 });
    expect(httpClient.get).toHaveBeenCalledWith("/admin/users", {
      params: { q: "ada", page: 2, size: 10 },
    });
  });

  it("listUsers no envía q vacío", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [] } });
    await api.listUsers({ q: "   " });
    expect(httpClient.get).toHaveBeenCalledWith("/admin/users", { params: { page: 0, size: 20 } });
  });

  it("changeUserStatus PUT /admin/users/{id}/status", async () => {
    httpClient.put.mockResolvedValue({});
    await api.changeUserStatus("u1", "BLOCKED");
    expect(httpClient.put).toHaveBeenCalledWith("/admin/users/u1/status", { status: "BLOCKED" });
  });

  it("grantRole PUT y revokeRole DELETE /admin/users/{id}/roles/{rol}", async () => {
    httpClient.put.mockResolvedValue({});
    httpClient.delete.mockResolvedValue({});
    await api.grantRole("u1", "ADMIN");
    await api.revokeRole("u1", "ADMIN");
    expect(httpClient.put).toHaveBeenCalledWith("/admin/users/u1/roles/ADMIN");
    expect(httpClient.delete).toHaveBeenCalledWith("/admin/users/u1/roles/ADMIN");
  });
});
