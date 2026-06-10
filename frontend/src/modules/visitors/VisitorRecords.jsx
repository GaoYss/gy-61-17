import { CalendarClock, Phone, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/format";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "approved", label: "已批准" },
  { value: "pending", label: "待审批" },
  { value: "rejected", label: "已拒绝" },
  { value: "expired", label: "已过期" },
];

export function VisitorRecords({ data }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const visitors = useMemo(() => {
    return data.visitors.filter((v) => {
      const matchesKeyword = keyword
        ? `${v.visitor_name}${v.host_name}${v.phone}${v.reason}${v.device_name}`.toLowerCase().includes(keyword.toLowerCase())
        : true;
      const matchesStatus = status ? v.pass_status === status : true;
      return matchesKeyword && matchesStatus;
    });
  }, [data.visitors, keyword, status]);

  return (
    <section className="view-stack">
      <header className="page-header">
        <div>
          <h1>访客通行记录</h1>
          <p>跟踪访客预约、审批状态、拜访对象和授权门禁。</p>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          <Search size={16} />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="按访客姓名搜索" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="record-grid">
        {visitors.map((visitor) => (
          <article className="record-card" key={visitor.id}>
            <div className="record-card-head">
              <strong><UserRound size={17} />{visitor.visitor_name}</strong>
              <StatusBadge value={visitor.pass_status} label={visitor.pass_status_display} />
            </div>
            <p>{visitor.reason}</p>
            <dl>
              <div><dt>受访人</dt><dd>{visitor.host_name}</dd></div>
              <div><dt>门禁</dt><dd>{visitor.device_name}</dd></div>
              <div><dt><Phone size={14} />电话</dt><dd>{visitor.phone}</dd></div>
              <div><dt><CalendarClock size={14} />到访</dt><dd>{formatDateTime(visitor.visit_time)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      {!visitors.length && <EmptyState />}
    </section>
  );
}
