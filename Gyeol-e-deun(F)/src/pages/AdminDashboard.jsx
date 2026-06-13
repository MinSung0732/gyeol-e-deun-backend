import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import '../css/admin-dashboard.css';

const YEARLY_DATA = {
  2026: [
    { name: '1월', 매출: 4200000, 지출: 2100000, 작년지출: 1800000 },
    { name: '2월', 매출: 5100000, 지출: 2400000, 작년지출: 2000000 },
    { name: '3월', 매출: 6200000, 지출: 2800000, 작년지출: 2300000 },
    { name: '4월', 매출: 5800000, 지출: 2600000, 작년지출: 2500000 },
    { name: '5월', 매출: 7400000, 지출: 3400000, 작년지출: 2900000 },
    { name: '6월', 매출: 8500000, 지출: 4000000, 작년지출: 3200000 },
    { name: '7월', 매출: 0, 지출: 0, 작년지출: 4300000 },
    { name: '8월', 매출: 0, 지출: 0, 작년지출: 3900000 },
    { name: '9월', 매출: 0, 지출: 0, 작년지출: 4100000 },
    { name: '10월', 매출: 0, 지출: 0, 작년지출: 4500000 },
    { name: '11월', 매출: 0, 지출: 0, 작년지출: 4700000 },
    { name: '12월', 매출: 0, 지출: 0, 작년지출: 5200000 },
  ],
  2025: [
    { name: '1월', 매출: 3100000, 지출: 1800000, 작년지출: 1500000 },
    { name: '2월', 매출: 3600000, 지출: 2000000, 작년지출: 1700000 },
    { name: '3월', 매출: 4100000, 지출: 2300000, 작년지출: 1900000 },
    { name: '4월', 매출: 4800000, 지출: 2500000, 작년지출: 2100000 },
    { name: '5월', 매출: 5900000, 지출: 2900000, 작년지출: 2400000 },
    { name: '6월', 매출: 6700000, 지출: 3200000, 작년지출: 2600000 },
    { name: '7월', 매출: 7600000, 지출: 4300000, 작년지출: 3000000 },
    { name: '8월', 매출: 7200000, 지출: 3900000, 작년지출: 3100000 },
    { name: '9월', 매출: 8100000, 지출: 4100000, 작년지출: 3300000 },
    { name: '10월', 매출: 8600000, 지출: 4500000, 작년지출: 3500000 },
    { name: '11월', 매출: 9200000, 지출: 4700000, 작년지출: 3700000 },
    { name: '12월', 매출: 10400000, 지출: 5200000, 작년지출: 4000000 },
  ],
};

const DAILY_PERFORMANCE = {
  2026: [
    { name: '6/1', 매출: 210000, 주문: 8 },
    { name: '6/2', 매출: 320000, 주문: 12 },
    { name: '6/3', 매출: 280000, 주문: 9 },
    { name: '6/4', 매출: 430000, 주문: 15 },
    { name: '6/5', 매출: 510000, 주문: 18 },
    { name: '6/6', 매출: 380000, 주문: 13 },
    { name: '6/7', 매출: 460000, 주문: 16 },
  ],
  2025: [
    { name: '6/1', 매출: 160000, 주문: 6 },
    { name: '6/2', 매출: 220000, 주문: 8 },
    { name: '6/3', 매출: 190000, 주문: 7 },
    { name: '6/4', 매출: 310000, 주문: 11 },
    { name: '6/5', 매출: 350000, 주문: 12 },
    { name: '6/6', 매출: 270000, 주문: 9 },
    { name: '6/7', 매출: 330000, 주문: 10 },
  ],
};

const CATEGORY_SALES_DATA = [
  { name: '식물', value: 400 },
  { name: '화분', value: 300 },
  { name: '키트', value: 260 },
  { name: '영양제', value: 180 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, date: '2026-06-12', type: '매출', amount: 50000, description: '모스테라 키트 2건' },
  { id: 2, date: '2026-06-11', type: '지출', amount: -150000, description: '화분 부자재 매입' },
  { id: 3, date: '2026-06-10', type: '매출', amount: 32000, description: '할인 상품 세트' },
  { id: 4, date: '2026-06-09', type: '지출', amount: -80000, description: '배송 포장비 정산' },
];

const COLORS = ['#4a5c4e', '#7c9b82', '#c9a45c', '#d87554'];

function formatWon(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [chartType, setChartType] = useState('monthly');

  const yearlyRows = YEARLY_DATA[selectedYear];
  const currentMonth = yearlyRows[5];
  const yearRevenue = yearlyRows.reduce((sum, row) => sum + row.매출, 0);
  const yearExpense = yearlyRows.reduce((sum, row) => sum + row.지출, 0);

  const chartTitle = {
    monthly: `${selectedYear}년 월별 매출/지출`,
    expense: `${selectedYear}년 월별 지출 비교`,
    daily: `${selectedYear}년 일일 실적`,
  }[chartType];

  const chart = useMemo(() => {
    if (chartType === 'expense') {
      return (
        <BarChart data={yearlyRows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${value / 10000}만`} />
          <RechartsTooltip formatter={(value) => formatWon(value)} />
          <Legend />
          <Bar dataKey="지출" fill="#c84d42" name="선택년도 지출" radius={[4, 4, 0, 0]} />
          <Bar dataKey="작년지출" fill="#d8b66a" name="전년도 지출" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === 'daily') {
      return (
        <LineChart data={DAILY_PERFORMANCE[selectedYear]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" tickFormatter={(value) => `${value / 10000}만`} />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip formatter={(value, name) => (name === '매출' ? formatWon(value) : `${value}건`)} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="매출" stroke="#4a5c4e" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="주문" stroke="#c84d42" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      );
    }

    return (
      <BarChart data={yearlyRows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `${value / 10000}만`} />
        <RechartsTooltip formatter={(value) => formatWon(value)} />
        <Legend />
        <Bar dataKey="매출" fill="#4a5c4e" name="매출" radius={[4, 4, 0, 0]} />
        <Bar dataKey="지출" fill="#c84d42" name="지출" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  }, [chartType, selectedYear, yearlyRows]);

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h2>관리자 대시보드 요약</h2>
      </div>

      <div className="summary-cards">
        <button type="button" className="card card-clickable" onClick={() => navigate('/admin/dashboard/monthly-sales')}>
          <h3>당월 매출</h3>
          <p className="amount text-blue">{formatWon(currentMonth.매출)}</p>
          <span className="trend positive">일별 내역 보기</span>
        </button>
        <div className="card">
          <h3>당월 지출</h3>
          <p className="amount text-red">{formatWon(currentMonth.지출)}</p>
          <span className="trend negative">전월 대비 5% 증가</span>
        </div>
        <div className="card">
          <h3>{selectedYear}년 누적 매출</h3>
          <p className="amount">{formatWon(yearRevenue)}</p>
          <span className="trend positive">누적 지출 {formatWon(yearExpense)}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <h3>{chartTitle}</h3>
            <div className="dashboard-chart-filters">
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} aria-label="년도 선택">
                <option value="2026">2026년</option>
                <option value="2025">2025년</option>
              </select>
              <select value={chartType} onChange={(event) => setChartType(event.target.value)} aria-label="그래프 종류 선택">
                <option value="monthly">년도별 월별 매출/지출</option>
                <option value="expense">월별 지출 비교</option>
                <option value="daily">일일 실적 그래프</option>
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              {chart}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>카테고리별 판매 비율</h3>
          <div className="chart-wrapper donut">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={CATEGORY_SALES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {CATEGORY_SALES_DATA.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>최근 매출/지출 내역</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>구분</th>
                <th>내역</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`badge ${tx.type === '매출' ? 'bg-success' : 'bg-danger'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.description}</td>
                  <td className={tx.type === '매출' ? 'text-blue' : 'text-red'}>
                    {tx.amount > 0 ? '+' : ''}{formatWon(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
