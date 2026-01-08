import React from 'react';
import { Shield, Ban, Eye, Edit2, ShieldCheck, AlertCircle, Clock, ClipboardList, Phone, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TechnicianListItem } from '../../../../infrastructure/repositories/admin/technicianRepository';

interface TechnicianListTableProps {
  technicians: TechnicianListItem[];
  onEdit: (tech: TechnicianListItem) => void;
  onToggleStatus: (tech: TechnicianListItem) => void;
  onReview: (id: string) => void;
}

const TechnicianListTable: React.FC<TechnicianListTableProps> = ({ 
  technicians, 
  onEdit, 
  onToggleStatus,
  onReview
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string, isSuspended: boolean) => {
    if (isSuspended) {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><Ban size={12}/> Suspended</span>;
    }
    switch (status) {
      case "VERIFIED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><ShieldCheck size={12}/> Verified</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><AlertCircle size={12}/> Rejected</span>;
      case "VERIFICATION_PENDING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={12}/> Review Pending</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  const renderActions = (tech: TechnicianListItem, isMobile = false) => {
    if (tech.status === 'VERIFICATION_PENDING') {
      return (
        <button 
            onClick={() => onReview(tech.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors ${isMobile ? 'w-full' : ''}`}
        >
            <ClipboardList size={14} />
            Review Application
        </button>
      );
    }
    
    if (tech.status === 'VERIFIED') {
      return (
        <div className={`flex gap-2 ${isMobile ? 'w-full' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
           <button 
              onClick={() => navigate(`/admin/technicians/${tech.id}`)} 
              className={`p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors ${isMobile ? 'flex-1 flex items-center justify-center' : ''}`}
              title="View Profile"
          >
              <Eye size={16} />
              {isMobile && <span className="ml-2 text-xs font-semibold">View</span>}
          </button>

          <button 
              onClick={() => onEdit(tech)}
              className={`p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors ${isMobile ? 'flex-1 flex items-center justify-center' : ''}`}
              title="Edit Details"
          >
              <Edit2 size={16} />
              {isMobile && <span className="ml-2 text-xs font-semibold">Edit</span>}
          </button>

          <button 
              onClick={() => onToggleStatus(tech)}
              className={`p-2 rounded-lg transition-colors ${tech.isSuspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'} ${isMobile ? 'flex-1 flex items-center justify-center' : ''}`}
              title={tech.isSuspended ? "Activate" : "Suspend"}
          >
              {tech.isSuspended ? <Shield size={16} /> : <Ban size={16} />}
              {isMobile && <span className="ml-2 text-xs font-semibold">{tech.isSuspended ? "Activate" : "Suspend"}</span>}
          </button>
        </div>
      );
    }

    return isMobile ? <span className="text-gray-400 text-xs italic text-center w-full block">No actions available</span> : <span className="text-gray-300 text-xs italic">No actions</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      
      {/* ================= MOBILE VIEW (CARDS) ================= */}
      {/* REMOVED 'p-4' from this container to fix the margin issue. Added 'py-4 px-1' or just rely on gap. */}
      <div className="md:hidden space-y-4 overflow-y-auto p-2"> 
        {technicians.map((tech) => (
          <div key={tech.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                  {tech.avatarUrl ? (
                    <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tech.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">ID: {tech.id.slice(-6)}</p>
                </div>
              </div>
              <div>{getStatusBadge(tech.status, tech.isSuspended)}</div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400"/>
                <span className="truncate">{tech.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400"/>
                <span>{tech.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400"/>
                <span>Joined: {new Date(tech.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              {renderActions(tech, true)}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP VIEW (TABLE) ================= */}
      <div className="hidden md:block overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
            <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {technicians.map((tech) => (
                <tr key={tech.id} className="group hover:bg-gray-50/80 transition-colors">
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 overflow-hidden flex-shrink-0">
                        {tech.avatarUrl ? (
                        <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">
                            {tech.name.charAt(0).toUpperCase()}
                        </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {tech.id.slice(-6)}</p>
                    </div>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-700 font-medium">{tech.email}</span>
                    <span className="text-xs text-gray-500">{tech.phone}</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    {getStatusBadge(tech.status, tech.isSuspended)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(tech.submittedAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {renderActions(tech, false)}
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicianListTable;