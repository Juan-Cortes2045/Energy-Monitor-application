import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../services/home", () => ({
  homeApi: {
    listHomes: vi.fn(),
    createHome: vi.fn(),
    joinHome: vi.fn(),
    toggleFavorite: vi.fn(),
    leaveHome: vi.fn(),
    removeMember: vi.fn(),
  },
}));

import { HomeProvider } from "./HomeContext";
import { useHomes } from "./useHomes";
import { homeApi } from "../services/home";

const home = {
  idHome: "h1",
  name: "Casa",
  homeTypeId: "t1",
  address: "Calle 1",
  accessCode: "ABC12345",
  description: "",
  creationDate: "2026-01-01",
  role: "OWNER",
  favorite: false,
};

const wrapper = ({ children }) => <HomeProvider>{children}</HomeProvider>;

describe("HomeContext (integración con cliente mockeado)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carga la lista al montar", async () => {
    homeApi.listHomes.mockResolvedValue([home]);
    const { result } = renderHook(() => useHomes(), { wrapper });
    expect(homeApi.listHomes).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.homes).toHaveLength(1);
    expect(result.current.homes[0].idHome).toBe("h1");
  });

  it("addHome crea y recarga la lista", async () => {
    homeApi.createHome.mockResolvedValue({ idHome: "h2" });
    homeApi.listHomes.mockResolvedValue([home]);
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    let err;
    await act(async () => {
      err = await result.current.addHome({ name: "Nuevo", homeTypeId: "t1", address: "Calle 2" });
    });
    expect(err).toBeNull();
    expect(homeApi.createHome).toHaveBeenCalledWith({
      name: "Nuevo",
      homeTypeId: "t1",
      address: "Calle 2",
    });
  });

  it("addHome propaga el error del servidor", async () => {
    const apiError = { name: "ApiError", status: 400, message: "name: inválido" };
    homeApi.createHome.mockRejectedValue(apiError);
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    let err;
    await act(async () => {
      err = await result.current.addHome({ name: "x", homeTypeId: "t1", address: "y" });
    });
    expect(err).toBe(apiError);
  });

  it("setFavorite alterna favorito", async () => {
    homeApi.listHomes.mockResolvedValue([home]);
    homeApi.toggleFavorite.mockResolvedValue({ userId: "u1", homeId: "h1", role: "OWNER", favorite: true });
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.setFavorite("h1");
    });
    expect(homeApi.toggleFavorite).toHaveBeenCalledWith("h1");
    expect(result.current.homes[0].favorite).toBe(true);
  });

  it("leaveHome elimina de la lista", async () => {
    homeApi.listHomes.mockResolvedValue([home]);
    homeApi.leaveHome.mockResolvedValue(undefined);
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const err = await result.current.leaveHome("h1");
      expect(err).toBeNull();
    });
    expect(homeApi.leaveHome).toHaveBeenCalledWith("h1");
  });

  it("removeMember llama al endpoint con ambos ids", async () => {
    homeApi.listHomes.mockResolvedValue([home]);
    homeApi.removeMember.mockResolvedValue(undefined);
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const err = await result.current.removeMember("h1", "u2");
      expect(err).toBeNull();
    });
    expect(homeApi.removeMember).toHaveBeenCalledWith("h1", "u2");
  });

  it("joinHome se une y recarga", async () => {
    homeApi.joinHome.mockResolvedValue({ userId: "u1", homeId: "h2", role: "MEMBER", favorite: false });
    homeApi.listHomes.mockResolvedValue([home]);
    const { result } = renderHook(() => useHomes(), { wrapper });
    await vi.waitFor(() => expect(result.current.loading).toBe(false));

    let err;
    await act(async () => {
      err = await result.current.joinHome("ABC12345");
    });
    expect(err).toBeNull();
    expect(homeApi.joinHome).toHaveBeenCalledWith({ accessCode: "ABC12345" });
  });
});
