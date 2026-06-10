import { useCallback, useEffect, useMemo, useState } from "react";

import { accessApi } from "../api/client";

export function useAccessData() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    stats: null,
    devices: [],
    visitors: [],
    alarms: [],
    logs: [],
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [stats, devices, visitors, alarms, logs] = await Promise.all([
          accessApi.stats(),
          accessApi.devices(),
          accessApi.visitors(),
          accessApi.alarms(),
          accessApi.doorLogs(),
        ]);
        if (mounted) {
          setState({ loading: false, error: "", stats, devices, visitors, alarms, logs });
        }
      } catch (error) {
        if (mounted) {
          setState((current) => ({ ...current, loading: false, error: error.message }));
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await accessApi.stats();
      setState((current) => ({ ...current, stats }));
    } catch (error) {
      // ignore
    }
  }, []);

  const updateVisitor = useCallback((id, patch) => {
    setState((current) => {
      const visitors = current.visitors.map((v) => (v.id === id ? { ...v, ...patch } : v));
      return { ...current, visitors };
    });
    refreshStats();
  }, [refreshStats]);

  const reloadVisitors = useCallback(async () => {
    try {
      const visitors = await accessApi.visitors();
      setState((current) => ({ ...current, visitors }));
    } catch (error) {
      // ignore
    }
  }, []);

  return useMemo(
    () => ({ ...state, updateVisitor, reloadVisitors }),
    [state, updateVisitor, reloadVisitors]
  );
}
