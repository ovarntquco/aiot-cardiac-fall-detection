import { useState } from "react";
import {
  Heart,
  Activity,
  MapPin,
  Bell,
  Settings,
  Home,
  LogOut,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Wifi,
  TrendingUp,
  Navigation,
  Save,
  RefreshCw,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type Screen = "login" | "home" | "alerts" | "settings" | "gps";

// ─── Dữ liệu demo ─────────────────────────────────────────────────────────────

const hrData = [
  { time: "08:00", value: 72 },
  { time: "08:30", value: 75 },
  { time: "09:00", value: 78 },
  { time: "09:30", value: 74 },
  { time: "10:00", value: 80 },
  { time: "10:30", value: 77 },
  { time: "11:00", value: 76 },
  { time: "11:30", value: 82 },
  { time: "12:00", value: 79 },
  { time: "12:30", value: 85 },
  { time: "13:00", value: 81 },
  { time: "13:30", value: 78 },
];

const spo2Data = [
  { time: "08:00", value: 98 },
  { time: "08:30", value: 97 },
  { time: "09:00", value: 98 },
  { time: "09:30", value: 96 },
  { time: "10:00", value: 97 },
  { time: "10:30", value: 98 },
  { time: "11:00", value: 99 },
  { time: "11:30", value: 97 },
  { time: "12:00", value: 98 },
  { time: "12:30", value: 96 },
  { time: "13:00", value: 97 },
  { time: "13:30", value: 98 },
];

const alertHistory = [
  {
    id: 1,
    type: "fall",
    severity: "critical",
    title: "Phát hiện té ngã",
    date: "27/06/2026",
    time: "09:14",
    heartRate: 108,
    spo2: 95,
    fallDetected: true,
    location: "Phòng khách",
    notes: "Độ tin cậy của mô hình AI: 94%. Đã thông báo cho người chăm sóc. Bệnh nhân tự phục hồi.",
  },
  {
    id: 2,
    type: "hr",
    severity: "warning",
    title: "Nhịp tim cao bất thường",
    date: "26/06/2026",
    time: "15:47",
    heartRate: 112,
    spo2: 97,
    fallDetected: false,
    location: "Phòng ngủ",
    notes: "Nhịp tim vượt ngưỡng 100 bpm. Trở về bình thường sau 8 phút.",
  },
  {
    id: 3,
    type: "spo2",
    severity: "warning",
    title: "SpO2 thấp",
    date: "25/06/2026",
    time: "11:22",
    heartRate: 84,
    spo2: 91,
    fallDetected: false,
    location: "Nhà bếp",
    notes: "SpO2 giảm xuống dưới ngưỡng 93%. Bệnh nhân được khuyên nghỉ ngơi. Phục hồi sau 12 phút.",
  },
  {
    id: 4,
    type: "fall",
    severity: "critical",
    title: "Phát hiện té ngã",
    date: "23/06/2026",
    time: "07:05",
    heartRate: 98,
    spo2: 96,
    fallDetected: true,
    location: "Nhà vệ sinh",
    notes: "Độ tin cậy của mô hình AI: 89%. Đã thông báo dịch vụ cấp cứu. Ghi nhận bầm tím nhẹ.",
  },
  {
    id: 5,
    type: "hr",
    severity: "info",
    title: "Nhịp tim thấp",
    date: "21/06/2026",
    time: "02:30",
    heartRate: 48,
    spo2: 98,
    fallDetected: false,
    location: "Phòng ngủ",
    notes: "Nhịp tim xuống dưới 50 bpm trong khi ngủ. Trở lại bình thường trong vòng 15 phút.",
  },
];

// ─── Khung bố cục ─────────────────────────────────────────────────────────────

function Sidebar({ current, onNav }: { current: Screen; onNav: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Tổng quan", icon: <Home size={18} /> },
    { id: "alerts", label: "Lịch sử cảnh báo", icon: <Bell size={18} /> },
    { id: "gps", label: "Vị trí GPS", icon: <MapPin size={18} /> },
    { id: "settings", label: "Cài đặt", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">CareWatch</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Theo dõi sức khỏe</p>
        </div>
      </div>

      {/* Thẻ bệnh nhân */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-secondary flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Nguyễn Thị Hoa</p>
          <p className="text-[10px] text-muted-foreground">Bệnh nhân · 78 tuổi</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-auto" />
      </div>

      {/* Điều hướng */}
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

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi size={13} className="text-emerald-500" />
          Thiết bị đã kết nối
        </div>
        <button
          onClick={() => onNav("login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Đăng xuất
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
          Đồng bộ lần cuối: 13:30 hôm nay
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={15} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Trần Thị Lan</span>
        </div>
      </div>
    </header>
  );
}

function DashboardLayout({ screen, onNav, title, subtitle, children }: {
  screen: Screen;
  onNav: (s: Screen) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={onNav} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Màn hình đăng nhập ───────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("lan.tran@giadinh.com");
  const [pw, setPw] = useState("••••••••");

  return (
    <div className="h-full w-full flex" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Cột trái */}
      <div className="w-[420px] flex-shrink-0 bg-primary flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">CareWatch</span>
        </div>

        <div>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Theo dõi sức khỏe<br />thông minh
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Hệ thống phát hiện té ngã bằng AI và theo dõi chỉ số sinh tồn liên tục cho người cao tuổi.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Activity size={14} />, text: "Theo dõi SpO2 & nhịp tim thời gian thực" },
              { icon: <AlertTriangle size={14} />, text: "Phát hiện nguy cơ té ngã bằng AI" },
              { icon: <MapPin size={14} />, text: "Theo dõi vị trí GPS" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100 text-sm">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">© 2026 CareWatch Health Systems</p>
      </div>

      {/* Cột phải */}
      <div className="flex-1 bg-background flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Chào mừng trở lại</h1>
            <p className="text-sm text-muted-foreground">Đăng nhập vào tài khoản người chăm sóc của bạn</p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => { e.preventDefault(); onLogin(); }}
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email hoặc tên đăng nhập
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="ban@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" defaultChecked />
                <span className="text-sm text-muted-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Đăng nhập
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Cần cấp quyền truy cập?{" "}
            <button className="text-primary hover:underline font-medium">
              Liên hệ điều phối viên chăm sóc
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Màn hình trang chủ ───────────────────────────────────────────────────────

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
  status: "normal" | "warning" | "critical";
  statusLabel: string;
  icon: React.ReactNode;
  color: string;
  data: { time: string; value: number }[];
  dataKey: string;
  min: number;
  max: number;
  refLine?: number;
}) {
  const statusColors = {
    normal: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    critical: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-5">
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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>
          {statusLabel}
        </span>
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
            {refLine && (
              <ReferenceLine y={refLine} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
        <span>6 giờ gần nhất</span>
        <span className="flex items-center gap-1">
          <TrendingUp size={12} />
          Xu hướng: Ổn định
        </span>
      </div>
    </div>
  );
}

function HomeScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <DashboardLayout screen="home" onNav={onNav} title="Tổng quan" subtitle="Bảng điều khiển · Nguyễn Thị Hoa · 27 tháng 6, 2026">
      {/* Thanh trạng thái */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Trạng thái thiết bị", value: "Đã kết nối", icon: <Wifi size={14} />, color: "emerald" },
          { label: "Cảnh báo hôm nay", value: "0 cảnh báo", icon: <Bell size={14} />, color: "blue" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border px-5 py-3.5 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              s.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
            }`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-sm font-semibold ${s.color === "emerald" ? "text-emerald-600" : "text-foreground"}`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Thẻ chỉ số chính */}
      <div className="grid grid-cols-2 gap-6 mb-6 items-start">
        <div className="flex flex-col gap-4">
          <MetricCard
            label="Nhịp tim"
            value={81}
            unit="bpm"
            status="normal"
            statusLabel="Bình thường"
            icon={<Heart size={16} />}
            color="#EF4444"
            data={hrData}
            dataKey="value"
            min={50}
            max={120}
            refLine={100}
          />
          {/* Widget ngưỡng nhịp tim */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart size={14} className="text-red-500" />
              </div>
              <span className="text-sm font-semibold text-foreground">Ngưỡng nhịp tim</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tối thiểu</p>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>50</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">bpm</p>
              </div>
              <div className="bg-background rounded-xl border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tối đa</p>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>100</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">bpm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <MetricCard
            label="Độ bão hòa oxy (SpO2)"
            value={98}
            unit="%"
            status="normal"
            statusLabel="Bình thường"
            icon={<Activity size={16} />}
            color="#2563EB"
            data={spo2Data}
            dataKey="value"
            min={88}
            max={100}
            refLine={93}
          />
          {/* Widget ngưỡng SpO2 */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Ngưỡng SpO2</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tối thiểu</p>
                <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>93</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">%</p>
              </div>
              <div className="bg-background rounded-xl border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Bình thường</p>
                <p className="text-xl font-bold text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>95–100</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}

// ─── Màn hình lịch sử cảnh báo ────────────────────────────────────────────────

function AlertHistoryScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const severityStyles = {
    critical: { badge: "bg-red-50 text-red-700", dot: "bg-red-500", icon: <AlertTriangle size={14} /> },
    warning: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", icon: <AlertTriangle size={14} /> },
    info: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-400", icon: <Bell size={14} /> },
  };

  const severityLabels: Record<string, string> = {
    critical: "NGHIÊM TRỌNG",
    warning: "CẢNH BÁO",
    info: "THÔNG TIN",
  };

  return (
    <DashboardLayout screen="alerts" onNav={onNav} title="Lịch sử cảnh báo" subtitle="Tất cả cảnh báo của bệnh nhân Nguyễn Thị Hoa">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">{alertHistory.length} cảnh báo trong 7 ngày qua</p>
          <button className="flex items-center gap-2 text-sm text-primary hover:underline">
            <RefreshCw size={13} />
            Làm mới
          </button>
        </div>

        <div className="space-y-3">
          {alertHistory.map((alert) => {
            const sty = severityStyles[alert.severity as keyof typeof severityStyles];
            const isOpen = expanded === alert.id;

            return (
              <div key={alert.id} className="bg-card rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-sm">
                {/* Hàng tóm tắt */}
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sty.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{alert.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sty.badge}`}>
                        {severityLabels[alert.severity]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.date} · {alert.time} · {alert.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Nhịp tim</p>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {alert.heartRate} bpm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">SpO2</p>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {alert.spo2}%
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Chi tiết mở rộng */}
                {isOpen && (
                  <div className="border-t border-border px-6 py-5 bg-background">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "Thời gian", value: `${alert.date}, ${alert.time}` },
                        { label: "Nhịp tim", value: `${alert.heartRate} bpm` },
                        { label: "SpO2", value: `${alert.spo2}%` },
                        { label: "Té ngã", value: alert.fallDetected ? "Có — Đã xác nhận" : "Không" },
                      ].map((d, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-3.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{d.label}</p>
                          <p className={`text-sm font-semibold ${
                            d.label === "Té ngã" && alert.fallDetected ? "text-red-600" : "text-foreground"
                          }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                            {d.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card rounded-xl border border-border p-3.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Ghi chú</p>
                      <p className="text-sm text-foreground">{alert.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Màn hình cài đặt ─────────────────────────────────────────────────────────

function SettingsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [hrMin, setHrMin] = useState(50);
  const [hrMax, setHrMax] = useState(100);
  const [spo2Min, setSpo2Min] = useState(93);
  const [saved, setSaved] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [fallDetect, setFallDetect] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout screen="settings" onNav={onNav} title="Cài đặt" subtitle="Cấu hình ngưỡng cảnh báo và tùy chọn thông báo">
      <div className="max-w-2xl space-y-6">

        {/* Ngưỡng nhịp tim */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Heart size={17} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Ngưỡng nhịp tim</h3>
              <p className="text-xs text-muted-foreground">Cảnh báo khi nhịp tim nằm ngoài khoảng này</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Tối thiểu (bpm)</label>
              <input
                type="number"
                value={hrMin}
                onChange={(e) => setHrMin(Number(e.target.value))}
                min={30}
                max={70}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <input type="range" min={30} max={70} value={hrMin} onChange={(e) => setHrMin(Number(e.target.value))}
                className="w-full mt-2 accent-red-500" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>30</span><span>70</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Tối đa (bpm)</label>
              <input
                type="number"
                value={hrMax}
                onChange={(e) => setHrMax(Number(e.target.value))}
                min={80}
                max={150}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <input type="range" min={80} max={150} value={hrMax} onChange={(e) => setHrMax(Number(e.target.value))}
                className="w-full mt-2 accent-red-500" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>80</span><span>150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ngưỡng SpO2 */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity size={17} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Ngưỡng SpO2</h3>
              <p className="text-xs text-muted-foreground">Cảnh báo khi độ bão hòa oxy giảm xuống dưới mức này</p>
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-medium text-muted-foreground mb-2">SpO2 tối thiểu (%)</label>
            <input
              type="number"
              value={spo2Min}
              onChange={(e) => setSpo2Min(Number(e.target.value))}
              min={85}
              max={98}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors mb-1"
              style={{ fontFamily: "'DM Mono', monospace" }}
            />
            <input type="range" min={85} max={98} value={spo2Min} onChange={(e) => setSpo2Min(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>85%</span><span>98%</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Hướng dẫn lâm sàng: ngưỡng cảnh báo dưới 94% được khuyến nghị cho người cao tuổi có bệnh lý hô hấp.
            </p>
          </div>
        </div>

        {/* Tùy chọn thông báo */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Bell size={17} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tùy chọn thông báo</h3>
              <p className="text-xs text-muted-foreground">Cách bạn nhận cảnh báo</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Thông báo qua Email", desc: "lan.tran@giadinh.com", val: notifyEmail, set: setNotifyEmail },
              { label: "Cảnh báo SMS", desc: "+84 912 345 678", val: notifySms, set: setNotifySms },
              { label: "Phát hiện té ngã bằng AI", desc: "Đánh giá nguy cơ té ngã thời gian thực", val: fallDetect, set: setFallDetect },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.val)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    item.val ? "bg-primary" : "bg-switch-background"
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    item.val ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm transition-opacity duration-300 ${saved ? "opacity-100 text-emerald-600" : "opacity-0"}`}>
            <CheckCircle size={14} className="inline mr-1.5" />
            Đã lưu cài đặt thành công
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Save size={15} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Màn hình GPS ──────────────────────────────────────────────────────────────

function GpsScreen({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <DashboardLayout screen="gps" onNav={onNav} title="Vị trí GPS" subtitle="Vị trí mới nhất của bệnh nhân">
      <div className="grid grid-cols-3 gap-6">
        {/* Khu vực bản đồ */}
        <div className="col-span-2 bg-card rounded-2xl border border-border overflow-hidden" style={{ height: 480 }}>
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
              <rect x="20" y="320" width="200" height="140" rx="4" fill="#D4DCE8" />
              <rect x="240" y="340" width="160" height="120" rx="4" fill="#D4DCE8" />
              <rect x="420" y="300" width="200" height="160" rx="4" fill="#D4DCE8" />

              <rect x="0" y="150" width="640" height="18" fill="#F4F6FA" />
              <rect x="0" y="300" width="640" height="18" fill="#F4F6FA" />
              <line x1="0" y1="159" x2="640" y2="159" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="12 8" />
              <line x1="0" y1="309" x2="640" y2="309" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="12 8" />

              <rect x="200" y="0" width="18" height="480" fill="#F4F6FA" />
              <rect x="360" y="0" width="18" height="480" fill="#F4F6FA" />
              <rect x="510" y="0" width="18" height="480" fill="#F4F6FA" />
              <line x1="209" y1="0" x2="209" y2="480" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="12 8" />
              <line x1="369" y1="0" x2="369" y2="480" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="12 8" />

              {/* Công viên */}
              <rect x="222" y="162" width="136" height="136" rx="4" fill="#C8DCC0" />
              <ellipse cx="260" cy="200" rx="20" ry="18" fill="#B4CCA8" />
              <ellipse cx="320" cy="220" rx="16" ry="14" fill="#B4CCA8" />
              <ellipse cx="290" cy="265" rx="18" ry="15" fill="#B4CCA8" />
              <text x="270" y="290" fontSize="10" fill="#7A9E72" textAnchor="middle" fontFamily="sans-serif">Công viên Hồ Sen</text>

              {/* Điểm đánh dấu bệnh nhân */}
              <circle cx="300" cy="159" r="18" fill="#2563EB" fillOpacity="0.15" />
              <circle cx="300" cy="159" r="10" fill="#2563EB" />
              <circle cx="300" cy="159" r="5" fill="white" />
              <circle cx="300" cy="159" r="22" fill="none" stroke="#2563EB" strokeWidth="2" strokeOpacity="0.4" />
              <circle cx="300" cy="159" r="30" fill="none" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.2" />

              {/* Nhãn tên */}
              <rect x="312" y="144" width="120" height="28" rx="6" fill="white" />
              <text x="372" y="162" fontSize="11" fill="#111827" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">Nguyễn Thị Hoa</text>
            </svg>

            {/* Huy hiệu trạng thái */}
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-md border border-border px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">Đang theo dõi trực tiếp</span>
            </div>

            {/* Nút zoom */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              <button className="w-8 h-8 bg-white rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">+</button>
              <button className="w-8 h-8 bg-white rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">−</button>
            </div>
          </div>
        </div>

        {/* Bảng thông tin */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Navigation size={15} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Vị trí hiện tại</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Địa chỉ</p>
                <p className="text-sm font-semibold text-foreground">14 Ngõ Hoa Cúc</p>
                <p className="text-xs text-muted-foreground">Phường Tây Hồ, Hà Nội 100000</p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Tọa độ</p>
                <p className="text-sm text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  21.0627° B
                </p>
                <p className="text-sm text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  105.8399° Đ
                </p>
              </div>

              <div className="border-t border-border pt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                Cập nhật 2 phút trước
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-muted-foreground" />
              Lịch sử vị trí
            </h3>
            <div className="space-y-2.5">
              {[
                { place: "Nhà — Phòng khách", time: "13:30", status: "current" },
                { place: "Nhà — Nhà bếp", time: "12:45", status: "past" },
                { place: "Nhà — Phòng ngủ", time: "11:00", status: "past" },
                { place: "Ngoài trời — Sân sau", time: "09:30", status: "past" },
              ].map((loc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    loc.status === "current" ? "bg-primary" : "bg-border"
                  }`} />
                  <div className="flex-1 flex items-center justify-between">
                    <p className={`text-xs ${loc.status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {loc.place}
                    </p>
                    <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {loc.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Trong vùng an toàn</p>
                <p className="text-xs text-emerald-600 mt-0.5">Bệnh nhân đang ở địa chỉ nhà. Không có cảnh báo ra khỏi vùng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Gốc ứng dụng ─────────────────────────────────────────────────────────────

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
