import { useCallback, useMemo, useState } from "react";

import { AppShell } from "./components/AppShell";
import { AlarmCenter } from "./modules/alarms/AlarmCenter";
import { Dashboard } from "./modules/dashboard/Dashboard";
import { DeviceManagement } from "./modules/devices/DeviceManagement";
import { DoorLogSearch } from "./modules/logs/DoorLogSearch";
import { VisitorRecords } from "./modules/visitors/VisitorRecords";
import { useAccessData } from "./hooks/useAccessData";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [visitorFilter, setVisitorFilter] = useState({ status: "", seq: 0 });
  const accessData = useAccessData();

  const jumpToVisitorFilter = useCallback((filter) => {
    setVisitorFilter({ ...filter, seq: Date.now() });
    setActiveView("visitors");
  }, []);

  const content = useMemo(() => {
    const commonProps = { data: accessData };
    const views = {
      dashboard: <Dashboard {...commonProps} onJumpToVisitorFilter={jumpToVisitorFilter} />,
      devices: <DeviceManagement {...commonProps} />,
      visitors: (
        <VisitorRecords
          {...commonProps}
          externalFilter={visitorFilter.seq ? visitorFilter : null}
        />
      ),
      alarms: <AlarmCenter {...commonProps} />,
      logs: <DoorLogSearch {...commonProps} />,
    };
    return views[activeView] || views.dashboard;
  }, [accessData, activeView, jumpToVisitorFilter, visitorFilter]);

  return (
    <AppShell activeView={activeView} onChangeView={setActiveView}>
      {content}
    </AppShell>
  );
}
