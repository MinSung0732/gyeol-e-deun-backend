import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, apiClient, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin-shell.css';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR');
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

function getRoleLabel(role) {
  if (role === 'ROLE_ADMIN') return '관리자';
  return '일반회원';
}

function AdminCustomerCrm() {
  const [members, setMembers] = useState([]);
  const [memoDrafts, setMemoDrafts] = useState({});
  const [benefitDrafts, setBenefitDrafts] = useState({});
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [memoOnly, setMemoOnly] = useState(false);
  const [blacklistOnly, setBlacklistOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingMemberId, setSavingMemberId] = useState(null);
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMembers = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(api.admin.members, {
        headers: authHeaders(token),
      });
      const nextMembers = Array.isArray(response.data) ? response.data : [];
      setMembers(nextMembers);
      setMemoDrafts(
        nextMembers.reduce((acc, member) => {
          acc[member.memberId] = member.adminMemo || '';
          return acc;
        }, {}),
      );
      setBenefitDrafts(
        nextMembers.reduce((acc, member) => {
          acc[member.memberId] = { rewardPoints: '', couponCount: '' };
          return acc;
        }, {}),
      );
    } catch (loadError) {
      console.error('고객회원 목록 조회 실패:', loadError);
      setError('고객회원 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const searchOk = !normalized
        || String(member.memberId).includes(normalized)
        || (member.name || '').toLowerCase().includes(normalized)
        || (member.loginId || '').toLowerCase().includes(normalized)
        || (member.email || '').toLowerCase().includes(normalized)
        || (member.phone || '').toLowerCase().includes(normalized);
      const roleOk = roleFilter === 'ALL' || member.role === roleFilter;
      const memoOk = !memoOnly || Boolean(member.adminMemo?.trim());
      const blacklistOk = !blacklistOnly || Boolean(member.blacklisted);

      return searchOk && roleOk && memoOk && blacklistOk;
    });
  }, [members, searchQuery, roleFilter, memoOnly, blacklistOnly]);

  const selectedMember = useMemo(
    () => members.find((member) => member.memberId === selectedMemberId) || null,
    [members, selectedMemberId],
  );

  const summary = useMemo(() => {
    const admins = members.filter((member) => member.role === 'ROLE_ADMIN').length;
    const withMemo = members.filter((member) => member.adminMemo?.trim()).length;
    const blacklisted = members.filter((member) => member.blacklisted).length;
    const totalPoints = members.reduce((sum, member) => sum + Number(member.rewardPoints || 0), 0);

    return [
      { label: '전체 회원', value: `${members.length}명` },
      { label: '관리자 계정', value: `${admins}명` },
      { label: '관리메모 등록', value: `${withMemo}명` },
      { label: '블랙리스트', value: `${blacklisted}명` },
      { label: '총 적립금', value: `${totalPoints.toLocaleString()}P` },
    ];
  }, [members]);

  const updateMember = (nextMember) => {
    setMembers((prev) => prev.map((member) => (
      member.memberId === nextMember.memberId ? nextMember : member
    )));
  };

  const handleMemoChange = (memberId, value) => {
    setMemoDrafts((prev) => ({ ...prev, [memberId]: value }));
  };

  const startMemoEdit = (member) => {
    setEditingMemoId(member.memberId);
    setMemoDrafts((prev) => ({
      ...prev,
      [member.memberId]: member.adminMemo || '',
    }));
    setMessage('');
    setError('');
  };

  const saveMemo = async (memberId) => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    setSavingMemberId(memberId);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.patch(
        api.admin.memberMemo(memberId),
        { adminMemo: memoDrafts[memberId] || '' },
        { headers: authHeaders(token) },
      );

      updateMember(response.data);
      setMemoDrafts((prev) => ({ ...prev, [memberId]: response.data.adminMemo || '' }));
      setMessage('관리메모가 저장되었습니다.');
      setEditingMemoId(null);
    } catch (saveError) {
      console.error('관리메모 저장 실패:', saveError);
      setError('관리메모 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingMemberId(null);
    }
  };

  const handleBenefitChange = (memberId, field, value) => {
    setBenefitDrafts((prev) => ({
      ...prev,
      [memberId]: {
        rewardPoints: '',
        couponCount: '',
        ...(prev[memberId] || {}),
        [field]: value,
      },
    }));
  };

  const addBenefits = async (memberId) => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    const draft = benefitDrafts[memberId] || {};
    const rewardPoints = Number(draft.rewardPoints || 0);
    const couponCount = Number(draft.couponCount || 0);
    if (rewardPoints < 0 || couponCount < 0 || (rewardPoints === 0 && couponCount === 0)) {
      setError('지급할 적립금 또는 쿠폰 수량을 1 이상 입력해 주세요.');
      return;
    }

    setSavingMemberId(memberId);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.patch(
        api.admin.memberBenefits(memberId),
        { rewardPoints, couponCount },
        { headers: authHeaders(token) },
      );
      updateMember(response.data);
      setBenefitDrafts((prev) => ({
        ...prev,
        [memberId]: { rewardPoints: '', couponCount: '' },
      }));
      setMessage('적립금/쿠폰이 지급되었습니다.');
    } catch (benefitError) {
      console.error('혜택 지급 실패:', benefitError);
      setError('혜택 지급 중 오류가 발생했습니다.');
    } finally {
      setSavingMemberId(null);
    }
  };

  const updateBlacklist = async (memberId, blacklisted) => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    setSavingMemberId(memberId);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.patch(
        api.admin.memberBlacklist(memberId),
        { blacklisted },
        { headers: authHeaders(token) },
      );
      updateMember(response.data);
      setMessage(blacklisted ? '블랙리스트로 등록되었습니다.' : '블랙리스트가 해제되었습니다.');
    } catch (blacklistError) {
      console.error('블랙리스트 변경 실패:', blacklistError);
      setError('블랙리스트 변경 중 오류가 발생했습니다.');
    } finally {
      setSavingMemberId(null);
    }
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <h2>고객회원 관리 CRM</h2>
        <p>회원 상세 정보, 혜택 지급, 블랙리스트 상태를 한 화면에서 관리합니다.</p>
      </div>

      <div className="admin-summary-grid crm-summary-grid">
        {summary.map((item) => (
          <div key={item.label} className="admin-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <h3>회원 목록</h3>
          <div className="admin-filter-row">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="회원명, ID, 이메일, 전화번호 검색"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="권한별 보기"
            >
              <option value="ALL">전체 권한</option>
              <option value="ROLE_USER">일반회원</option>
              <option value="ROLE_ADMIN">관리자</option>
            </select>
            <label className="admin-filter-check">
              <input
                type="checkbox"
                checked={memoOnly}
                onChange={(event) => setMemoOnly(event.target.checked)}
              />
              <span>관리메모 있음만</span>
            </label>
            <label className="admin-filter-check danger">
              <input
                type="checkbox"
                checked={blacklistOnly}
                onChange={(event) => setBlacklistOnly(event.target.checked)}
              />
              <span>블랙리스트만</span>
            </label>
          </div>
        </div>

        {message && <p className="admin-inline-message success">{message}</p>}
        {error && <p className="admin-inline-message error">{error}</p>}
        {isLoading && <p className="admin-empty-state">고객회원 목록을 불러오는 중입니다.</p>}

        {!isLoading && !error && filteredMembers.length === 0 && (
          <p className="admin-empty-state">표시할 회원이 없습니다.</p>
        )}

        {!isLoading && !error && filteredMembers.length > 0 && (
          <table className="admin-inline-table admin-crm-table">
            <thead>
              <tr>
                <th>회원 ID</th>
                <th>이름</th>
                <th>로그인 ID</th>
                <th>권한</th>
                <th>가입일</th>
                <th>누적 구매</th>
                <th>최근 접속</th>
                <th>혜택</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.memberId}>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.loginId}</td>
                  <td>{getRoleLabel(member.role)}</td>
                  <td>{formatDate(member.createdAt)}</td>
                  <td>{formatCurrency(member.totalPurchaseAmount)}</td>
                  <td>{formatDate(member.lastLoginAt)}</td>
                  <td>{Number(member.rewardPoints || 0).toLocaleString()}P / 쿠폰 {member.couponCount || 0}</td>
                  <td>
                    <span className={`admin-status-pill ${member.blacklisted ? 'danger' : 'normal'}`}>
                      {member.blacklisted ? '구매 제한' : '정상'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-inline-button"
                      onClick={() => setSelectedMemberId(
                        selectedMemberId === member.memberId ? null : member.memberId,
                      )}
                    >
                      {selectedMemberId === member.memberId ? '닫기' : '상세'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedMember && (
        <section className="admin-table-card admin-member-detail-panel">
          <div className="admin-member-detail-header">
            <div>
              <h3>{selectedMember.name} 상세 관리</h3>
              <p>{selectedMember.email} · {selectedMember.phone}</p>
            </div>
            <span className={`admin-status-pill ${selectedMember.blacklisted ? 'danger' : 'normal'}`}>
              {selectedMember.blacklisted ? '구매 제한 회원' : '정상 회원'}
            </span>
          </div>

          <div className="admin-member-detail-grid">
            <div className="admin-member-info-list">
              <span>가입일 <strong>{formatDateTime(selectedMember.createdAt)}</strong></span>
              <span>최근 접속일 <strong>{formatDateTime(selectedMember.lastLoginAt)}</strong></span>
              <span>누적 구매 금액 <strong>{formatCurrency(selectedMember.totalPurchaseAmount)}</strong></span>
              <span>보유 적립금 <strong>{Number(selectedMember.rewardPoints || 0).toLocaleString()}P</strong></span>
              <span>보유 쿠폰 <strong>{selectedMember.couponCount || 0}장</strong></span>
            </div>

            <div className="admin-member-control-box">
              <h4>관리메모</h4>
              {editingMemoId === selectedMember.memberId ? (
                <div className="admin-memo-editor wide">
                  <input
                    type="text"
                    value={memoDrafts[selectedMember.memberId] || ''}
                    onChange={(event) => handleMemoChange(selectedMember.memberId, event.target.value)}
                    placeholder="고객 관리메모 입력"
                  />
                  <button
                    type="button"
                    onClick={() => saveMemo(selectedMember.memberId)}
                    disabled={savingMemberId === selectedMember.memberId}
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="admin-memo-viewer wide">
                  <span>{selectedMember.adminMemo || '등록된 메모 없음'}</span>
                  <button type="button" onClick={() => startMemoEdit(selectedMember)}>관리</button>
                </div>
              )}
            </div>

            <div className="admin-member-control-box">
              <h4>적립금 및 쿠폰 수동 지급</h4>
              <div className="admin-benefit-form">
                <input
                  type="number"
                  min="0"
                  value={benefitDrafts[selectedMember.memberId]?.rewardPoints || ''}
                  onChange={(event) => handleBenefitChange(selectedMember.memberId, 'rewardPoints', event.target.value)}
                  placeholder="적립금"
                />
                <input
                  type="number"
                  min="0"
                  value={benefitDrafts[selectedMember.memberId]?.couponCount || ''}
                  onChange={(event) => handleBenefitChange(selectedMember.memberId, 'couponCount', event.target.value)}
                  placeholder="쿠폰 수"
                />
                <button
                  type="button"
                  onClick={() => addBenefits(selectedMember.memberId)}
                  disabled={savingMemberId === selectedMember.memberId}
                >
                  지급
                </button>
              </div>
            </div>

            <div className="admin-member-control-box danger">
              <h4>블랙리스트 관리</h4>
              <p>블랙리스트 등록 시 장바구니 담기 등 구매 흐름이 제한됩니다.</p>
              <button
                type="button"
                className={selectedMember.blacklisted ? 'admin-release-button' : 'admin-danger-button'}
                onClick={() => updateBlacklist(selectedMember.memberId, !selectedMember.blacklisted)}
                disabled={savingMemberId === selectedMember.memberId}
              >
                {selectedMember.blacklisted ? '블랙리스트 해제' : '블랙리스트 등록'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminCustomerCrm;
