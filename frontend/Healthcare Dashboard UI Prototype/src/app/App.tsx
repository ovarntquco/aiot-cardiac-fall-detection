import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Heart,
  Home,
  Lock,
  LogOut,
  MapPin,
  Navigation,
  RefreshCw,
  Save,
  Settings,
  Shield,
  TrendingUp,
  User,
  Wifi,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAlertDetail, fetchAlerts, fetchOverview, type AlertDetail, type AlertSummary, type OverviewResponse } from "./api";

type Screen = "login" | "home" | "alerts" | "settings" | "gps";
type MetricStatus = "normal" | "warning" | "critical";

function Sidebar({ current, onNav }: { current: Screen; onNav: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: ReactNode }[] = [
    { id: "home", label: "Tong quan", icon: <Home size={18} /> },
    { id: "alerts", label: "Lich su canh bao", icon: <Bell size={18} /> },
    { id: "gps", label: "Vi tri GPS", icon: <MapPin size={18} /> },
    { id: "settings", label: "Cai dat", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">CareWatch</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Theo doi suc khoe</p>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-2 p-3 rounded-lg bg-secondary flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Nguyen Thi Hoa</p>
          <p className="text-[10px] text-muted-foreground">Benh nhan - 78 tuoi</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-auto" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              current === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi size={13} className="text-emerald-500" />
          Thiet bi da ket noi
        </div>
        <button
          onClick={() => onNav("login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Dang xuat
        </button>
      </div>
    </aside>
  );
}

function TopHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={13} />
          Dong bo lan cuoi: hom nay
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={15} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Tran Thi Lan</span>
        </div>
      </div>
    </header>
  );
}

function DashboardLayout({
  screen,
  onNav,
  title,
  subtitle,
  children,
}: {
  screen: Screen;
  onNav: (s: Screen) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={onNav} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("lan.tran@giadinh.com");
  const [pw, setPw] = useState("••••••••");

  return (
    <div className="h-full w-full flex" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <div className="w-[420px] flex-shrink-0 bg-primary flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">CareWatch</span>
        </div>

        <div>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Theo doi suc khoe
              <br />
              thong minh
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              He thong theo doi nhip tim, SpO2 va lich su canh bao cho nguoi cao tuoi.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Activity size={14} />, text: "Theo doi SpO2 va nhip tim" },
              { icon: <AlertTriangle size={14} />, text: "Luu tru lich su canh bao" },
              { icon: <MapPin size={14} />, text: "Theo doi vi tri GPS" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3 text-blue-100 text-sm">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">2026 CareWatch Health Systems</p>
      </div>

      <div className="flex-1 bg-background flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Chao mung tro lai</h1>
            <p className="text-sm text-muted-foreground">Dang nhap vao tai khoan nguoi cham soc</p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email hoac ten dang nhap</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="ban@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mat khau</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(event) => setPw(event.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Nhap mat khau"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "An mat khau" : "Hien mat khau"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              Dang nhap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  status,
  statusLabel,
  icon,
  color,
  data,
  min,
  max,
  refLine,
}: {
  label: string;
  value: number;
  unit: string;
  status: MetricStatus;
  statusLabel: string;
  icon: ReactNode;
  color: string;
  data: { time: string; value: number }[];
  min: number;
  max: number;
  refLine?: number;
}) {
  const statusColors: Record<MetricStatus, string> = {
    normal: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    critical: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {value}
            </span>
            <span className="text-base text-muted-foreground mb-1">{unit}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>{statusLabel}</span>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} domain={[min, max]} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#6B7280" }}
            />
            {refLine !== undefined && <ReferenceLine y={refLine} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await fetchOverview());
    } catch (loadError) {
      setOverview(null);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai du lieu tong quan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const patientName = overview?.patient?.name || "Benh nhan";
  const latest = overview?.latestMeasurement;
  const thresholds = overview?.thresholds;
  const hrStatus = latest && thresholds ? getHeartRateStatus(latest.heartRate, thresholds) : "warning";
  const spo2Status = latest && thresholds ? getSpo2Status(latest.spo2, thresholds) : "warning";
  const hrData = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.heartRate,
  })) || [];
  const spo2Data = overview?.recentMeasurements.map((measurement) => ({
    time: formatTime(measurement.measuredAt),
    value: measurement.spo2,
  })) || [];

  return (
    <DashboardLayout screen="home" onNav={onNav} title="Tong quan" subtitle={`Bang dieu khien - ${patientName}`}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          Du lieu duoc tai tu API va repository cua he thong
        </p>
        <button onClick={loadOverview} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <RefreshCw size={13} />
          Lam moi
        </button>
      </div>

      {loading && <StateMessage title="Dang tai tong quan" message="Dang truy van chi so moi nhat va nguong ca nhan." />}
      {error && !loading && <StateMessage title="Khong the tai du lieu" message={error} tone="error" />}
      {!loading && !error && overview && !latest && (
        <StateMessage title="Chua co du lieu do" message="Benh nhan hien chua co ban ghi do suc khoe nao trong database." tone="empty" />
      )}

      {!loading && !error && overview && latest && thresholds && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatusTile label="Trang thai thiet bi" value={overview.patient?.deviceStatus === "CONNECTED" ? "Da ket noi" : "Chua ket noi"} icon={<Wifi size={14} />} />
            <StatusTile label="Canh bao hom nay" value={`${overview.alertCountToday} canh bao`} icon={<Bell size={14} />} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 items-start">
            <div className="flex flex-col gap-4">
              <MetricCard
                label="Nhip tim"
                value={latest.heartRate}
                unit="bpm"
                status={hrStatus}
                statusLabel={statusLabel(hrStatus)}
                icon={<Heart size={16} />}
                color="#EF4444"
                data={hrData}
                min={Math.min(40, thresholds.heartRateMin - 10)}
                max={Math.max(130, thresholds.heartRateMax + 10)}
                refLine={thresholds.heartRateMax}
              />
              <ThresholdCard
                icon={<Heart size={14} className="text-red-500" />}
                title="Nguong nhip tim"
                values={[
                  { label: "Toi thieu", value: thresholds.heartRateMin, unit: "bpm" },
                  { label: "Toi da", value: thresholds.heartRateMax, unit: "bpm" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-4">
              <MetricCard
                label="Do bao hoa oxy (SpO2)"
                value={latest.spo2}
                unit="%"
                status={spo2Status}
                statusLabel={statusLabel(spo2Status)}
                icon={<Activity size={16} />}
                color="#2563EB"
                data={spo2Data}
                min={85}
                max={100}
                refLine={thresholds.spo2Min}
              />
              <ThresholdCard
                icon={<Activity size={14} className="text-primary" />}
                title="Nguong SpO2"
                values={[
                  { label: "Toi thieu", value: thresholds.spo2Min, unit: "%" },
                  { label: "Toi da", value: thresholds.spo2Max, unit: "%" },
                ]}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Thoi gian do gan nhat</p>
              <p className="font-semibold text-foreground">{formatDateTime(latest.measuredAt)}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp size={12} />
              Lay ban ghi suc khoe moi nhat theo thoi gian do
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function AlertHistoryScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [details, setDetails] = useState<Record<string, AlertDetail>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    setExpanded(null);
    try {
      setAlerts(await fetchAlerts());
    } catch (loadError) {
      setAlerts([]);
      setError(loadError instanceof Error ? loadError.message : "Khong the tai lich su canh bao.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }

    setExpanded(id);
    setDetailError(null);
    if (details[id]) return;

    setDetailLoading(id);
    try {
      const detail = await fetchAlertDetail(id);
      setDetails((current) => ({ ...current, [id]: detail }));
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "Khong the tai chi tiet canh bao.");
    } finally {
      setDetailLoading(null);
    }
  };

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <DashboardLayout screen="alerts" onNav={onNav} title="Lich su canh bao" subtitle="Tat ca canh bao cua benh nhan duoc lay tu database">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {loading ? "Dang tai danh sach canh bao" : `${alerts.length} canh bao`}
          </p>
          <button onClick={loadAlerts} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <RefreshCw size={13} />
            Lam moi
          </button>
        </div>

        {loading && <StateMessage title="Dang tai lich su" message="Dang truy van canh bao moi nhat truoc." />}
        {error && !loading && <StateMessage title="Khong the tai canh bao" message={error} tone="error" />}
        {!loading && !error && alerts.length === 0 && (
          <StateMessage title="Chua co canh bao" message="Database chua co canh bao nao cho benh nhan nay." tone="empty" />
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isOpen = expanded === alert.id;
              const detail = details[alert.id];
              const sty = severityStyle(alert.severity);

              return (
                <div key={alert.id} className="bg-card rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-sm">
                  <button className="w-full flex items-center gap-4 px-6 py-4 text-left" onClick={() => void toggleAlert(alert.id)}>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sty.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{alert.message}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sty.badge}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.type} - {alert.status || "NEW"} - {formatDateTime(alert.occurredAt)}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-6 py-5 bg-background">
                      {detailLoading === alert.id && <StateMessage title="Dang tai chi tiet" message="Dang lay thong tin canh bao theo ID." compact />}
                      {detailError && !detailLoading && <StateMessage title="Khong the tai chi tiet" message={detailError} tone="error" compact />}
                      {detail && !detailLoading && (
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <DetailCell label="ID" value={detail.id} />
                            <DetailCell label="Thoi gian" value={formatDateTime(detail.occurredAt)} />
                            <DetailCell label="Nhip tim" value={detail.heartRate === null ? "Khong co" : `${detail.heartRate} bpm`} />
                            <DetailCell label="SpO2" value={detail.spo2 === null ? "Khong co" : `${detail.spo2}%`} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <DetailCell label="Loai" value={detail.type} />
                            <DetailCell label="Muc do" value={detail.severity} />
                            <DetailCell label="Xac suat te nga" value={detail.fallProbability === null ? "Khong co" : `${Math.round(detail.fallProbability * 100)}%`} />
                          </div>
                          <div className="bg-card rounded-lg border border-border p-3.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Noi dung canh bao</p>
                            <p className="text-sm text-foreground">{detail.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SettingsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [hrMin, setHrMin] = useState(60);
  const [hrMax, setHrMax] = useState(100);
  const [spo2Min, setSpo2Min] = useState(95);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout screen="settings" onNav={onNav} title="Cai dat" subtitle="Cau hinh nguong canh bao va thong bao">
      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Heart size={17} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Nguong nhip tim</h3>
              <p className="text-xs text-muted-foreground">Canh bao khi nhip tim nam ngoai khoang nay</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <NumberSetting label="Toi thieu (bpm)" value={hrMin} min={30} max={80} onChange={setHrMin} />
            <NumberSetting label="Toi da (bpm)" value={hrMax} min={80} max={150} onChange={setHrMax} />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity size={17} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Nguong SpO2</h3>
              <p className="text-xs text-muted-foreground">Canh bao khi do bao hoa oxy giam duoi muc nay</p>
            </div>
          </div>
          <NumberSetting label="SpO2 toi thieu (%)" value={spo2Min} min={85} max={98} onChange={setSpo2Min} />
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm transition-opacity duration-300 ${saved ? "opacity-100 text-emerald-600" : "opacity-0"}`}>
            <CheckCircle size={14} className="inline mr-1.5" />
            Da luu cai dat thanh cong
          </p>
          <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Save size={15} />
            Luu thay doi
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function GpsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <DashboardLayout screen="gps" onNav={onNav} title="Vi tri GPS" subtitle="Vi tri moi nhat cua benh nhan">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card rounded-lg border border-border overflow-hidden" style={{ height: 480 }}>
          <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice">
              <rect width="640" height="480" fill="#E8EEF4" />
              <rect x="20" y="20" width="180" height="120" rx="4" fill="#D4DCE8" />
              <rect x="220" y="20" width="140" height="80" rx="4" fill="#D4DCE8" />
              <rect x="380" y="20" width="240" height="120" rx="4" fill="#D4DCE8" />
              <rect x="20" y="180" width="120" height="100" rx="4" fill="#D4DCE8" />
              <rect x="160" y="160" width="200" height="140" rx="4" fill="#D4DCE8" />
              <rect x="380" y="160" width="120" height="80" rx="4" fill="#D4DCE8" />
              <rect x="520" y="160" width="100" height="120" rx="4" fill="#D4DCE8" />
              <rect x="0" y="150" width="640" height="18" fill="#F4F6FA" />
              <rect x="0" y="300" width="640" height="18" fill="#F4F6FA" />
              <rect x="200" y="0" width="18" height="480" fill="#F4F6FA" />
              <rect x="360" y="0" width="18" height="480" fill="#F4F6FA" />
              <rect x="222" y="162" width="136" height="136" rx="4" fill="#C8DCC0" />
              <text x="290" y="290" fontSize="10" fill="#7A9E72" textAnchor="middle" fontFamily="sans-serif">Cong vien Ho Sen</text>
              <circle cx="300" cy="159" r="18" fill="#2563EB" fillOpacity="0.15" />
              <circle cx="300" cy="159" r="10" fill="#2563EB" />
              <circle cx="300" cy="159" r="5" fill="white" />
              <circle cx="300" cy="159" r="22" fill="none" stroke="#2563EB" strokeWidth="2" strokeOpacity="0.4" />
              <rect x="312" y="144" width="120" height="28" rx="6" fill="white" />
              <text x="372" y="162" fontSize="11" fill="#111827" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">Nguyen Thi Hoa</text>
            </svg>
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md border border-border px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">Dang theo doi truc tiep</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <InfoPanel title="Vi tri hien tai" icon={<Navigation size={15} className="text-primary" />}>
            <p className="text-sm font-semibold text-foreground">14 Ngo Hoa Cuc</p>
            <p className="text-xs text-muted-foreground">Tay Ho, Ha Noi</p>
            <p className="mt-3 text-sm text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>21.0627 N</p>
            <p className="text-sm text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>105.8399 E</p>
          </InfoPanel>
          <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Trong vung an toan</p>
                <p className="text-xs text-emerald-600 mt-0.5">Khong co canh bao ra khoi vung an toan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border px-5 py-3.5 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ThresholdCard({ icon, title, values }: { icon: ReactNode; title: string; values: { label: string; value: number; unit: string }[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center">{icon}</div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {values.map((item) => (
          <div key={item.label} className="bg-background rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground break-words" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</p>
    </div>
  );
}

function StateMessage({ title, message, tone = "info", compact = false }: { title: string; message: string; tone?: "info" | "error" | "empty"; compact?: boolean }) {
  const toneClass = tone === "error"
    ? "bg-red-50 border-red-100 text-red-700"
    : tone === "empty"
      ? "bg-slate-50 border-slate-200 text-slate-700"
      : "bg-blue-50 border-blue-100 text-blue-700";

  return (
    <div className={`${compact ? "p-4" : "p-6"} rounded-lg border ${toneClass}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm mt-1 opacity-80">{message}</p>
    </div>
  );
}

function NumberSetting({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        style={{ fontFamily: "'DM Mono', monospace" }}
      />
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full mt-2 accent-blue-600" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function InfoPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">{icon}</div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function getHeartRateStatus(value: number, thresholds: OverviewResponse["thresholds"]): MetricStatus {
  if (!thresholds) return "warning";
  if (value < thresholds.heartRateMin || value > thresholds.heartRateMax) return "critical";
  return "normal";
}

function getSpo2Status(value: number, thresholds: OverviewResponse["thresholds"]): MetricStatus {
  if (!thresholds) return "warning";
  if (value < thresholds.spo2Min) return "critical";
  if (value > thresholds.spo2Max) return "warning";
  return "normal";
}

function statusLabel(status: MetricStatus) {
  if (status === "critical") return "Canh bao";
  if (status === "warning") return "Can theo doi";
  return "Binh thuong";
}

function severityStyle(severity: string) {
  const normalized = severity.toUpperCase();
  if (normalized === "HIGH" || normalized === "CRITICAL") {
    return { badge: "bg-red-50 text-red-700", dot: "bg-red-500" };
  }
  if (normalized === "MEDIUM" || normalized === "WARNING") {
    return { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
  }
  return { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-400" };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <div className="w-full h-screen overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {screen === "login" && <LoginScreen onLogin={() => setScreen("home")} />}
      {screen === "home" && <HomeScreen onNav={setScreen} />}
      {screen === "alerts" && <AlertHistoryScreen onNav={setScreen} />}
      {screen === "settings" && <SettingsScreen onNav={setScreen} />}
      {screen === "gps" && <GpsScreen onNav={setScreen} />}
    </div>
  );
}
