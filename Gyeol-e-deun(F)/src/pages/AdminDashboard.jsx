import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import '../css/admin-dashboard.css';

const MONTHLY_REVENUE_DATA = [
  { name: '1월', 매출: 4000, 지출: 2400 },
  { name: '2월', 매출: 3000, 지출: 1398 },
  { name: '3월', 매출: 2000, 지출: 9800 },
  { name: '4월', 매출: 2780, 지출: 3908 },
  { name: '5월', 매출: 1890, 지출: 4800 },
  { name: '6월', 매출: 2390, 지출: 3800 },
  { name: '7월', 매출: 3490, 지출: 4300 },
  { name: '8월', 매출: 4000, 지출: 2400 },
  { name: '9월', 매출: 5000, 지출: 2100 },
  { name: '10월', 매출: 6500, 지출: 3000 },
  { name: '11월', 매출: 7000, 지출: 3200 },
  { name: '12월', 매출: 8500, 지출: 4000 },
];

const CATEGORY_SALES_DATA = [
  { name: '식물/화분', value: 400 },
  { name: '가드닝 용품', value: 300 },
  { name: '씨앗/모종', value: 300 },
  { name: '영양제/비료', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RECENT_TRANSACTIONS = [
  { id: 1, date: '2026-06-12', type: '매출', amount: 50000, description: '몬스테라 외 2건' },
  { id: 2, date: '2026-06-11', type: '지출', amount: -150000, description: '화분 부자재 매입' },
  { id: 3, date: '2026-06-10', type: '매출', amount: 32000, description: '선인장 세트' },
  { id: 4, date: '2026-06-09', type: '지출', amount: -80000, description: '배송 택배비 정산' },
];

function AdminDashboard() {
  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h2>관리자 대시보드 🪴</h2>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>당월 매출</h3>
          <p className="amount text-blue">₩ 8,500,000</p>
          <span className="trend positive">▲ 15% (전월 대비)</span>
        </div>
        <div className="card">
          <h3>당월 지출</h3>
          <p className="amount text-red">₩ 4,000,000</p>
          <span className="trend negative">▼ 5% (전월 대비)</span>
        </div>
        <div className="card">
          <h3>올해 누적 매출</h3>
          <p className="amount">₩ 50,450,000</p>
          <span className="trend positive">▲ 22% (전년 대비)</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>월별 매출 및 지출 내역서 (올해)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MONTHLY_REVENUE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `₩ ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="매출" fill="#4A5C4E" name="매출" radius={[4, 4, 0, 0]} />
                <Bar dataKey="지출" fill="#e74c3c" name="지출" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              {RECENT_TRANSACTIONS.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`badge ${tx.type === '매출' ? 'bg-success' : 'bg-danger'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.description}</td>
                  <td className={tx.type === '매출' ? 'text-blue' : 'text-red'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
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
