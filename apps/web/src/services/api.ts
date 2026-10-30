const API_BASE = 'https://gym-management-worker.pkaakash007.workers.dev';

export async function fetchLiveOccupancy() {
  try {
    const res = await fetch(`${API_BASE}/api/attendance/live-occupancy`);
    if (res.ok) {
      const data = await res.json();
      return data?.data || null;
    }
  } catch (err) {
    console.warn('Backend live occupancy fallback to local state:', err);
  }
  return null;
}

export async function postCloudflareCheckIn(memberId: string, memberName?: string) {
  try {
    const res = await fetch(`${API_BASE}/api/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: memberId,
        member_name: memberName || 'Gym Member',
        check_in_method: 'Touchless QR',
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend check-in fallback to local state:', err);
  }
  return null;
}

export async function postCloudflareCheckOut(attendanceId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/attendance/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_id: attendanceId }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend check-out fallback to local state:', err);
  }
  return null;
}

export async function fetchHealthPing(): Promise<{ ok: boolean; latency: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) {
      return { ok: true, latency: Math.round(performance.now() - start) };
    }
  } catch (err) {
    // offline
  }
  return { ok: false, latency: 0 };
}
