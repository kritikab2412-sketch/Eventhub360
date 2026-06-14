import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, Edit, Trash2, SlidersHorizontal, Plus, ArrowLeft, ArrowRight, X } from 'lucide-react';
import API from '../api/api';

const Employees = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Query & Pagination state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    designation: '',
    salary: '',
    department_id: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get('/employees', {
        params: {
          search,
          department_id: deptFilter || undefined,
          page,
          sortBy,
          sortOrder
        }
      });
      setEmployees(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/employees/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, page, sortBy, sortOrder]);

  const handleDelete = async (emp) => {
    if (!window.confirm(`Are you sure you want to delete ${emp.users.name}'s profile? This action is irreversible.`)) return;

    try {
      await API.delete(`/employees/${emp.id}`);
      setMessage({ text: `${emp.users.name} has been deleted successfully.`, type: 'success' });
      fetchEmployees();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Deletion failed.', type: 'error' });
    }
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setEditForm({
      phone: emp.phone || '',
      address: emp.address || '',
      designation: emp.designation || '',
      salary: emp.salary ? parseFloat(emp.salary).toString() : '0',
      department_id: emp.department_id || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.put(`/employees/${selectedEmp.id}`, {
        ...editForm,
        salary: parseFloat(editForm.salary),
        department_id: editForm.department_id ? parseInt(editForm.department_id) : null
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div>
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>Employee Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View and search corporate employee records.</p>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'badge-approved' : 'badge-rejected'} style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', width: 'fit-content' }}>
          {message.text}
        </div>
      )}

      {/* Toolbar: Search, Filters */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flex: '1', minWidth: '280px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by name, email, or designation..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '48px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="form-input" 
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            style={{ width: '180px' }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>

          <select 
            className="form-input" 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{ width: '180px' }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="salary-asc">Salary (Low-High)</option>
            <option value="salary-desc">Salary (High-Low)</option>
            <option value="created_at-desc">Newest Hires</option>
          </select>
        </div>
      </div>

      {/* Directory Grid/Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No employees found matching the filters.
        </div>
      ) : (
        <>
          <div className="table-container glass-panel">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Contact</th>
                  <th>Salary</th>
                  {['admin', 'hr', 'manager'].includes(user?.role) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          {emp.users.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{emp.users.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{emp.users.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.departments?.department_name || 'N/A'}</td>
                    <td>{emp.designation || 'Trainee'}</td>
                    <td>{emp.phone || 'N/A'}</td>
                    <td>${parseFloat(emp.salary || 0).toLocaleString()}</td>
                    {['admin', 'hr', 'manager'].includes(user?.role) && (
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOpenEdit(emp)}>
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          {user?.role === 'admin' && (
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.1)' }} onClick={() => handleDelete(emp)}>
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1}>
              <ArrowLeft size={16} />
              <span>Prev</span>
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Edit Profile Modal (HR / Admin / Manager) */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="glow-text">Edit Profile: {selectedEmp?.users.name}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2-col" style={{ marginTop: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    disabled={user?.role === 'manager'} // Managers can edit phone/address but designation is HR/Admin control
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    disabled={user?.role === 'manager'}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label className="form-label">Department</label>
                <select 
                  className="form-input" 
                  value={editForm.department_id}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  disabled={user?.role === 'manager'}
                >
                  <option value="">No Department Assigned</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
