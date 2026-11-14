import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Armchair, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Users,
  LayoutGrid,
  Info
} from 'lucide-react';

export default function OwnerSeatingArrangement() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    floor_number: 0,
    description: '',
    initial_tables_count: 10,
    chairs_per_table: 4
  });

  const [newTableForm, setNewTableForm] = useState({
    room_id: '',
    table_number: '',
    capacity: 4
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch rooms');

      setRooms(data.rooms || []);
      if (data.rooms && data.rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(data.rooms[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoomForm.name.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoomForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create room');

      setSuccessMsg(data.message || 'Room created successfully!');
      setShowAddRoomModal(false);
      setNewRoomForm({
        name: '',
        floor_number: 0,
        description: '',
        initial_tables_count: 10,
        chairs_per_table: 4
      });
      await fetchRooms();
      if (data.roomId) setSelectedRoomId(data.roomId);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    const targetRoomId = newTableForm.room_id || selectedRoomId;
    if (!targetRoomId) return;

    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: targetRoomId,
          table_number: newTableForm.table_number ? parseInt(newTableForm.table_number, 10) : undefined,
          capacity: parseInt(newTableForm.capacity, 10) || 4
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add table');

      setSuccessMsg(data.message || 'Table added successfully!');
      setShowAddTableModal(false);
      setNewTableForm({ room_id: '', table_number: '', capacity: 4 });
      await fetchRooms();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Are you sure you want to delete Table #${table.table_number} (${table.capacity} chairs)?`)) {
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owner/tables/${table.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete table');

      setSuccessMsg(data.message);
      await fetchRooms();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete room "${room.name}" and all its tables? This cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owner/rooms/${room.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete room');

      setSuccessMsg(data.message);
      setSelectedRoomId(null);
      await fetchRooms();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Compute aggregate metrics
  const totalRooms = rooms.length;
  const totalTables = rooms.reduce((acc, r) => acc + (parseInt(r.total_tables, 10) || 0), 0);
  const totalChairs = rooms.reduce((acc, r) => acc + (parseInt(r.total_chairs, 10) || 0), 0);
  const occupiedTables = rooms.reduce((acc, r) => acc + (parseInt(r.occupied_tables, 10) || 0), 0);
  const occupancyRate = totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

  const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0] || null;
  const currentTables = currentRoom?.tables || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner / Heading */}
      <div style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(109, 40, 217, 0.25)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🏢</span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>
              Restaurant Rooms & Seating Arrangement
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#DDD6FE', maxWidth: '750px' }}>
            Design and organize restaurant dining spaces by Room and Floor. Configure tables and chairs per table, 
            inspect live visual seating plans, and analyze capacity distribution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowAddRoomModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: '#F59E0B',
              color: '#FFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Plus size={16} />
            <span>Add Room / Floor</span>
          </button>

          <button
            onClick={() => {
              setNewTableForm({ room_id: selectedRoomId || (rooms[0]?.id || ''), table_number: '', capacity: 4 });
              setShowAddTableModal(true);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Armchair size={16} />
            <span>Add Table to Room</span>
          </button>

          <button
            onClick={fetchRooms}
            title="Refresh Rooms & Tables"
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#991B1B',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#166534',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: '#FFF',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.3px' }}>TOTAL ROOMS / FLOORS</span>
            <Building2 size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>{totalRooms}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Active dining zones</div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.3px' }}>TOTAL RESTAURANT TABLES</span>
            <LayoutGrid size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>{totalTables}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Across all floors</div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.3px' }}>TOTAL SEATING CAPACITY</span>
            <Armchair size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>{totalChairs} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748B' }}>Chairs</span></div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Average ~{(totalChairs / (totalTables || 1)).toFixed(1)} chairs/table</div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.3px' }}>LIVE OCCUPANCY RATE</span>
            <Users size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>{occupancyRate}%</div>
          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginTop: '4px' }}>
            {totalTables - occupiedTables} Tables Available
          </div>
        </div>
      </div>

      {/* Room / Floor Tabs Selection Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '8px 12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {rooms.map(room => {
          const isSelected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                borderRadius: '12px',
                border: isSelected ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
                background: isSelected ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' : '#FFF',
                color: isSelected ? '#5B21B6' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isSelected ? '#7C3AED' : '#F1F5F9',
                color: isSelected ? '#FFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '800'
              }}>
                F{room.floor_number}
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{room.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '6px' }}>
                  <span>{room.total_tables || 0} Tables</span>
                  <span>•</span>
                  <span>{room.total_chairs || 0} Chairs</span>
                  <span>•</span>
                  <span style={{ color: '#16A34A', fontWeight: '700' }}>{room.available_tables || 0} Available</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Room Seating Plan View */}
      {currentRoom && (
        <div style={{
          background: '#FFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Room Header & Quick Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                  {currentRoom.name}
                </h3>
                <span style={{
                  background: '#EDE9FE',
                  color: '#6D28D9',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  Floor Level: {currentRoom.floor_number}
                </span>
                <span style={{
                  background: currentRoom.status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                  color: currentRoom.status === 'Active' ? '#15803D' : '#B45309',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {currentRoom.status}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                {currentRoom.description || 'Spatial seating arrangement & chair allocation for this dining hall.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  setNewTableForm({ room_id: currentRoom.id, table_number: '', capacity: 4 });
                  setShowAddTableModal(true);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>Add Table to this Room</span>
              </button>

              {currentRoom.occupied_tables === 0 && rooms.length > 1 && (
                <button
                  onClick={() => handleDeleteRoom(currentRoom)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Delete this room"
                >
                  <Trash2 size={14} />
                  <span>Delete Room</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Seating Arrangement Layout (Tables with Realistic Chairs) */}
          <div style={{
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
            borderRadius: '16px',
            padding: '28px',
            border: '1.5px dashed #CBD5E1',
            minHeight: '400px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#64748B'
            }}>
              <span>🗺️ VISUAL SEATING PLAN ({currentTables.length} Tables • {currentRoom.total_chairs} Chairs)</span>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
                  Available
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Seated / Dining
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6' }}></span>
                  Order Placed
                </span>
              </div>
            </div>

            {currentTables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                <Armchair size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <h4 style={{ margin: 0, fontSize: '16px', color: '#475569' }}>No tables in this room yet</h4>
                <p style={{ margin: '6px 0 16px 0', fontSize: '13px' }}>Click &quot;Add Table to this Room&quot; to arrange seating.</p>
                <button
                  onClick={() => {
                    setNewTableForm({ room_id: currentRoom.id, table_number: '', capacity: 4 });
                    setShowAddTableModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#7C3AED',
                    color: '#FFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  + Add First Table
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '30px'
              }}>
                {currentTables.map(tbl => {
                  const capacity = tbl.capacity || 4;
                  const isAvailable = tbl.status === 'Available';
                  const isSeated = tbl.status === 'Seated';
                  const isOrderPlaced = tbl.status === 'Order Placed';

                  let tableBg = '#FFFFFF';
                  let tableBorder = '#10B981';
                  let statusBadgeBg = '#DCFCE7';
                  let statusBadgeColor = '#15803D';

                  if (!isAvailable) {
                    tableBorder = isSeated ? '#F59E0B' : '#3B82F6';
                    statusBadgeBg = isSeated ? '#FEF3C7' : '#EFF6FF';
                    statusBadgeColor = isSeated ? '#B45309' : '#1D4ED8';
                  }

                  // Create chair list (1 to capacity)
                  const chairs = Array.from({ length: capacity }, (_, i) => i + 1);

                  return (
                    <div
                      key={tbl.id}
                      style={{
                        position: 'relative',
                        padding: '24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {/* Visual Table Structure with Chairs Positioned Around */}
                      <div style={{
                        position: 'relative',
                        width: '160px',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* Realistic Chairs arranged around the perimeter */}
                        {chairs.map((chairNum, idx) => {
                          // Calculate perimeter position for chairs
                          // Distribute evenly around rectangle
                          let top = '0';
                          let left = '50%';
                          let transform = 'translate(-50%, -50%)';

                          if (capacity === 2) {
                            if (idx === 0) { top = '50%'; left = '0'; transform = 'translate(-50%, -50%)'; }
                            else { top = '50%'; left = '100%'; transform = 'translate(-50%, -50%)'; }
                          } else if (capacity === 4) {
                            if (idx === 0) { top = '0%'; left = '50%'; transform = 'translate(-50%, -50%)'; } // Top
                            else if (idx === 1) { top = '50%'; left = '100%'; transform = 'translate(-50%, -50%)'; } // Right
                            else if (idx === 2) { top = '100%'; left = '50%'; transform = 'translate(-50%, -50%)'; } // Bottom
                            else { top = '50%'; left = '0%'; transform = 'translate(-50%, -50%)'; } // Left
                          } else {
                            // 6 or 8 chairs
                            const angle = (idx / capacity) * 2 * Math.PI;
                            const rx = 76;
                            const ry = 62;
                            const x = Math.round(80 + rx * Math.cos(angle));
                            const y = Math.round(70 + ry * Math.sin(angle));
                            left = `${x}px`;
                            top = `${y}px`;
                            transform = 'translate(-50%, -50%)';
                          }

                          return (
                            <div
                              key={chairNum}
                              title={`Chair #${chairNum} (${isAvailable ? 'Empty' : 'Occupied'})`}
                              style={{
                                position: 'absolute',
                                top,
                                left,
                                transform,
                                width: '26px',
                                height: '26px',
                                borderRadius: '8px',
                                background: isAvailable ? '#E2E8F0' : '#DBEAFE',
                                border: isAvailable ? '1.5px solid #94A3B8' : '1.5px solid #3B82F6',
                                color: isAvailable ? '#475569' : '#1D4ED8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '900',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                zIndex: 2
                              }}
                            >
                              {chairNum}
                            </div>
                          );
                        })}

                        {/* Central Table Surface */}
                        <div style={{
                          width: '104px',
                          height: '84px',
                          borderRadius: '16px',
                          background: tableBg,
                          border: `2.5px solid ${tableBorder}`,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          zIndex: 3,
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A' }}>
                            T#{tbl.table_number}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748B' }}>
                            {capacity} Chairs
                          </span>
                          <span style={{
                            marginTop: '2px',
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: statusBadgeBg,
                            color: statusBadgeColor
                          }}>
                            {tbl.status}
                          </span>
                        </div>
                      </div>

                      {/* Table Info & Actions */}
                      <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        {tbl.customer_name && (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>
                            👤 {tbl.customer_name}
                          </span>
                        )}

                        {isAvailable && (
                          <button
                            onClick={() => handleDeleteTable(tbl)}
                            title="Delete table"
                            style={{
                              padding: '4px 6px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFF',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD ROOM / FLOOR                                */}
      {/* ======================================================== */}
      {showAddRoomModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              🏢 Add New Room / Floor
            </h3>

            <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Room / Floor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor AC Hall, Rooftop Garden"
                  value={newRoomForm.name}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Floor Level (0 = Ground)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newRoomForm.floor_number}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, floor_number: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Initial Tables Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newRoomForm.initial_tables_count}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, initial_tables_count: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Chairs Per Table (Default 4)
                </label>
                <select
                  value={newRoomForm.chairs_per_table}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, chairs_per_table: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value={2}>2 Chairs (Couples Table)</option>
                  <option value={4}>4 Chairs (Standard Dining - Recommended)</option>
                  <option value={6}>6 Chairs (Family Table)</option>
                  <option value={8}>8 Chairs (Large Party Table)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Spacious open dining with garden ambience"
                  value={newRoomForm.description}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#7C3AED',
                    color: '#FFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: submitting ? 'wait' : 'pointer',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {submitting ? 'Creating Room...' : 'Create Room & Tables'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD TABLE TO ROOM (ACCORDING TO SIZE)           */}
      {/* ======================================================== */}
      {showAddTableModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              🪑 Add Table to Room
            </h3>

            <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Select Room / Floor *
                </label>
                <select
                  required
                  value={newTableForm.room_id || selectedRoomId || ''}
                  onChange={(e) => setNewTableForm({ ...newTableForm, room_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Floor {r.floor_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Table Size / Chair Capacity *
                </label>
                <select
                  value={newTableForm.capacity}
                  onChange={(e) => setNewTableForm({ ...newTableForm, capacity: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value={2}>2 Chairs (Small Table)</option>
                  <option value={4}>4 Chairs (Standard Table - Default)</option>
                  <option value={6}>6 Chairs (Medium Family Table)</option>
                  <option value={8}>8 Chairs (Large Dining Table)</option>
                  <option value={10}>10 Chairs (Banquet Table)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Custom Table Number (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Leave empty for next auto number"
                  value={newTableForm.table_number}
                  onChange={(e) => setNewTableForm({ ...newTableForm, table_number: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563EB',
                    color: '#FFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: submitting ? 'wait' : 'pointer'
                  }}
                >
                  {submitting ? 'Adding Table...' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
