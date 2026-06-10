import { CalendarClock, Phone, RotateCcw, Search, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { accessApi } from "../../api/client";
import { formatDateTime } from "../../utils/format";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "approved", label: "已批准" },
  { value: "pending", label: "待审批" },
  { value: "rejected", label: "已拒绝" },
  { value: "expired", label: "已过期" },
];

export function VisitorRecords({ data, onHighlightId }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [visitors, setVisitors] = useState(data.visitors);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const cardRefs = useRef({});
  const lastHighlightSeq = useRef(0);

  useEffect(() => {
    if (!searching && keyword === "") {
      setVisitors(data.visitors);
    }
  }, [data.visitors, keyword, searching]);

  const scrollToCard = useCallback((id) => {
    requestAnimationFrame(() => {
      const el = cardRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(id);
        setTimeout(() => setHighlightedId(null), 2500);
      }
    });
  }, []);

  useEffect(() => {
    if (!onHighlightId?.id || onHighlightId.seq === lastHighlightSeq.current) return;
    lastHighlightSeq.current = onHighlightId.seq;
    const id = onHighlightId.id;

    const tryScroll = () => {
      if (visitors.some((v) => v.id === id)) {
        scrollToCard(id);
      } else {
        setKeyword("");
        setStatus("");
        accessApi.visitors().then((list) => {
          setVisitors(list);
          setTimeout(() => scrollToCard(id), 50);
        });
      }
    };
    tryScroll();
  }, [onHighlightId, visitors, scrollToCard]);

  const handleSearch = async () => {
    setSearchError("");
    if (!keyword.trim()) {
      setVisitors(data.visitors);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const result = await accessApi.visitors({ name: keyword.trim() });
      setVisitors(result);
    } catch (error) {
      setSearchError(error.message || "搜索失败");
      setVisitors([]);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");
    setVisitors(data.visitors);
    setSearchError("");
    setSearching(false);
  };

  const handleApprove = async (visitor) => {
    setPendingId(visitor.id);
    try {
      const updated = await accessApi.updateVisitor(visitor.id, { pass_status: "approved" });
      const apply = (list) => list.map((v) => (v.id === visitor.id ? { ...v, ...updated } : v));
      setVisitors(apply);
      if (keyword === "") {
        data.visitors = apply(data.visitors);
      }
      scrollToCard(visitor.id);
    } catch (error) {
      alert(`审批失败：${error.message}`);
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (visitor) => {
    if (!confirm(`确定拒绝访客「${visitor.visitor_name}」的访问申请？`)) return;
    setPendingId(visitor.id);
    try {
      const updated = await accessApi.updateVisitor(visitor.id, { pass_status: "rejected" });
      const apply = (list) => list.map((v) => (v.id === visitor.id ? { ...v, ...updated } : v));
      setVisitors(apply);
      if (keyword === "") {
        data.visitors = apply(data.visitors);
      }
    } catch (error) {
      alert(`拒绝失败：${error.message}`);
    } finally {
      setPendingId(null);
    }
  };

  const filteredVisitors = useMemo(() => {
    if (!status) return visitors;
    return visitors.filter((v) => v.pass_status === status);
  }, [visitors, status]);

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
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            placeholder="请输入访客姓名（精确匹配）"
          />
        </label>
        <button className="search-btn" onClick={handleSearch} disabled={searching}>
          {searching ? "搜索中..." : "搜索"}
        </button>
        <button className="reset-btn" onClick={handleReset} disabled={searching}>
          <RotateCcw size={14} /> 重置
        </button>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {searchError && <div className="error-panel">{searchError}</div>}

      <div className="record-grid">
        {filteredVisitors.map((visitor) => (
          <article
            className={`record-card ${highlightedId === visitor.id ? "highlighted" : ""}`}
            key={visitor.id}
            ref={(el) => (cardRefs.current[visitor.id] = el)}
          >
            <div className="record-card-head">
              <strong>
                <UserRound size={17} />
                {visitor.visitor_name}
              </strong>
              <StatusBadge value={visitor.pass_status} label={visitor.pass_status_display} />
            </div>
            <p>{visitor.reason}</p>
            <dl>
              <div>
                <dt>受访人</dt>
                <dd>{visitor.host_name}</dd>
              </div>
              <div>
                <dt>门禁</dt>
                <dd>{visitor.device_name}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={14} />
                  电话
                </dt>
                <dd>{visitor.phone}</dd>
              </div>
              <div>
                <dt>
                  <CalendarClock size={14} />
                  到访
                </dt>
                <dd>{formatDateTime(visitor.visit_time)}</dd>
              </div>
            </dl>
            {visitor.pass_status === "pending" && (
              <div className="record-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(visitor)}
                  disabled={pendingId === visitor.id}
                >
                  {pendingId === visitor.id ? "处理中..." : "批准"}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(visitor)}
                  disabled={pendingId === visitor.id}
                >
                  拒绝
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!filteredVisitors.length && !searching && <EmptyState />}
    </section>
  );
}
