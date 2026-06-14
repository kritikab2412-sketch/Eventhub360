import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Laptop, Search, Plus, Trash2, Edit, RefreshCw, X, Link2 } from 'lucide-react';
import API from '../api/api';

const Assets = () => {
  const { user } = useSelector((state) => state.auth);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  // Selected items
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Forms state
  const [createForm, setCreateForm] = useState({
    asset_code: '',
    asset_name: '',
    asset_type: 'Laptop',
    purchase_date: '',
    purchase_cost: '',
    status: 'Available'
  });
  
  const [allocateForm, setAllocateForm] = useState({
    employee_id: '',
    remarks: ''
  });

  const [returnForm, setReturnForm] = useState({
    status: 'Available',
    remarks: ''
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchAssetData = async () => {
    try {
      if (['admin', 'hr', 'manager'].includes(user?.role)) {
        const [assetsRes, empsRes] = await Promise.all([
          API.get('/assets', {
            params: {
              search,
              type: typeFilter || undefined,
              status: statusFilter || undefined
            }
          }),
          API.get('/employees?limit=100') // fetch active employees list for dropdown allocation
        ]);
        setAssets(assetsRes.data.data);
        setEmployees(empsRes.data.data);
      } else {
        // Employee sees their own allocated assets
        const myRes = await API.get('/assets/my');
        setMyAllocations(myRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load asset details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [search, typeFilter, statusFilter, user]);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.post('/assets', {
        ...createForm,
        purchase_cost: createForm.purchase_cost ? parseFloat(createForm.purchase_cost) : null
      });
      setMessage({ text: 'Asset created successfully!', type: 'success' });
      setShowCreateModal(false);
      setCreateForm({
        asset_code: '',
        asset_name: '',
        asset_type: 'Laptop',
        purchase_date: '',
        purchase_cost: '',
        status: 'Available'
      });
      fetchAssetData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create asset.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenAllocate = (asset) => {
    setSelectedAsset(asset);
    setAllocateForm({ employee_id: '', remarks: '' });
    setShowAllocateModal(true);
  };

  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.post('/assets/allocate', {
        asset_id: selectedAsset.id,
        employee_id: parseInt(allocateForm.employee_id),
        remarks: allocateForm.remarks
      });
      setMessage({ text: 'Asset allocated successfully!', type: 'success' });
      setShowAllocateModal(false);
      fetchAssetData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to allocate asset.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenReturn = (asset) => {
    setSelectedAsset(asset);
    setReturnForm({ status: 'Available', remarks: '' });
    setShowReturnModal(true);
  };

  const handleReturnAsset = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.post(`/assets/${selectedAsset.id}/return`, returnForm);
      setMessage({ text: 'Asset marked as returned successfully!', type: 'success' });
      setShowReturnModal(false);
      fetchAssetData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to return asset.', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete asset ${asset.asset_name}?`)) return;

    try {
      await API.delete(`/assets/${asset.id}`);
      setMessage({ text: 'Asset deleted successfully.', type: 'success' });
      fetchAssetData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Deletion failed.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div>
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>Asset Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track hardware, devices, and company credentials.</p>
        </div>
        {['admin', 'hr'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'badge-approved' : 'badge-rejected'} style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', width: 'fit-content' }}>
          {message.text}
        </div>
      )}

      {['admin', 'hr', 'manager'].includes(user?.role) ? (
        /* Privileged View: Catalog table & Filters */
        <>
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flex: '1', minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by code or asset name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '48px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="form-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '150px' }}>
                <option value="">All Types</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Access Card">Access Card</option>
                <option value="Mouse">Mouse</option>
                <option value="ID Card">ID Card</option>
              </select>

              <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '150px' }}>
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="table-container glass-panel">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Allocation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No assets found in database.</td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const activeAlloc = asset.asset_allocations?.[0];
                    return (
                      <tr key={asset.id}>
                        <td><code>{asset.asset_code}</code></td>
                        <td><strong>{asset.asset_name}</strong></td>
                        <td>{asset.asset_type}</td>
                        <td>
                          <span className={`badge badge-${asset.status.toLowerCase()}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td>
                          {activeAlloc ? (
                            <div>
                              <div style={{ fontWeight: '600' }}>{activeAlloc.employee_profiles?.users.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Since: {new Date(activeAlloc.allocated_date).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {asset.status === 'Available' ? (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOpenAllocate(asset)}>
                                <Link2 size={14} />
                                <span>Assign</span>
                              </button>
                            ) : asset.status === 'Allocated' ? (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOpenReturn(asset)}>
                                <RefreshCw size={14} />
                                <span>Return</span>
                              </button>
                            ) : null}

                            {user?.role === 'admin' && asset.status !== 'Allocated' && (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => handleDeleteAsset(asset)}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Employee View: My Allocated Assets */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '20px' }}>My Assigned Hardware & Credentials</h3>
          {myAllocations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No assets have been allocated to you yet.</p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Allocated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myAllocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td><code>{alloc.assets.asset_code}</code></td>
                      <td><strong>{alloc.assets.asset_name}</strong></td>
                      <td>{alloc.assets.asset_type}</td>
                      <td>{new Date(alloc.allocated_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="glow-text">Add Asset to Inventory</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateAsset}>
              <div className="form-group">
                <label className="form-label">Asset Code / Serial</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={createForm.asset_code}
                  onChange={(e) => setCreateForm({ ...createForm, asset_code: e.target.value })}
                  placeholder="LP-2026-X8"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={createForm.asset_name}
                  onChange={(e) => setCreateForm({ ...createForm, asset_name: e.target.value })}
                  placeholder="MacBook Pro M3 Max"
                  required 
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Asset Category</label>
                  <select 
                    className="form-input" 
                    value={createForm.asset_type}
                    onChange={(e) => setCreateForm({ ...createForm, asset_type: e.target.value })}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Access Card">Access Card</option>
                    <option value="Mouse">Mouse</option>
                    <option value="ID Card">ID Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={createForm.purchase_date}
                    onChange={(e) => setCreateForm({ ...createForm, purchase_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Cost ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={createForm.purchase_cost}
                  onChange={(e) => setCreateForm({ ...createForm, purchase_cost: e.target.value })}
                  placeholder="2499.00" 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>Create Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {showAllocateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="glow-text">Allocate Asset</h3>
              <button className="close-btn" onClick={() => setShowAllocateModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAllocateAsset}>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong>Asset Selected:</strong> {selectedAsset?.asset_name} (<code>{selectedAsset?.asset_code}</code>)
              </div>

              <div className="form-group">
                <label className="form-label">Assign To Employee</label>
                <select 
                  className="form-input" 
                  value={allocateForm.employee_id}
                  onChange={(e) => setAllocateForm({ ...allocateForm, employee_id: e.target.value })}
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.users.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={allocateForm.remarks}
                  onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
                  placeholder="Assigned for corporate operations" 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>Assign Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="glow-text">Return Asset</h3>
              <button className="close-btn" onClick={() => setShowReturnModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleReturnAsset}>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong>Asset returning:</strong> {selectedAsset?.asset_name}
              </div>

              <div className="form-group">
                <label className="form-label">Returned Condition Status</label>
                <select 
                  className="form-input" 
                  value={returnForm.status}
                  onChange={(e) => setReturnForm({ ...returnForm, status: e.target.value })}
                >
                  <option value="Available">Available (Perfect Condition)</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Return Remarks</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={returnForm.remarks}
                  onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                  placeholder="Device returned by developer" 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>Process Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
