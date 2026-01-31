"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Search, Clock, CheckCircle, AlertCircle, User, ChevronRight, Zap, Eye, Loader2, X } from 'lucide-react';
import { getAssignedTickets, resolveTicket } from '../../../services/ticketService';
import Swal from 'sweetalert2';

export default function EmployeeTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolvingTicket, setResolvingTicket] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAssignedTickets(1, 100, filter === 'all' ? undefined : filter);
      if (response.success) {
        setTickets(response.tickets || []);
      } else {
        setError(response.message || 'Failed to load tickets');
      }
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    const ticket = tickets.find(t => t._id === ticketId);
    
    const result = await Swal.fire({
      title: 'Resolve Ticket?',
      text: `Mark ticket "${ticket?.title}" as resolved?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#242021',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, resolve it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      color: '#242021',
      customClass: {
        confirmButton: 'bg-[#242021] hover:bg-[#3a3537] text-[#ffd17a] px-6 py-2 rounded-lg font-medium transition-colors',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors',
        title: 'text-[#242021] font-bold',
        content: 'text-gray-700'
      }
    });

    if (result.isConfirmed) {
      try {
        setResolvingTicket(ticketId);
        
        const response = await resolveTicket(ticketId);
        if (response.success) {
          setTickets(prev => prev.map(ticket => 
            ticket._id === ticketId ? { ...ticket, status: 'resolved' } : ticket
          ));
          
          Swal.fire({
            title: 'Resolved!',
            text: 'Ticket has been marked as resolved.',
            icon: 'success',
            confirmButtonColor: '#242021',
            confirmButtonText: 'OK',
            background: '#fff',
            color: '#242021',
            customClass: {
              confirmButton: 'bg-[#242021] hover:bg-[#3a3537] text-[#ffd17a] px-6 py-2 rounded-lg font-medium transition-colors',
              title: 'text-[#242021] font-bold',
              content: 'text-gray-700'
            }
          });
        }
      } catch (err) {
        console.error('Error resolving ticket:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to resolve ticket',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          background: '#fff',
          color: '#242021',
          customClass: {
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors',
            title: 'text-[#242021] font-bold',
            content: 'text-gray-700'
          }
        });
      } finally {
        setResolvingTicket(null);
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const customerName = ticket.userId?.name || ticket.userId?.fullName || 'Unknown';
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    all: tickets.length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    open: tickets.filter(t => t.status === "open").length,
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "urgent": return "from-red-500 to-red-600";
      case "high": return "from-orange-500 to-orange-600";
      case "medium": return "from-amber-500 to-amber-600";
      case "low": return "from-emerald-500 to-emerald-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case "urgent": return "bg-red-50 text-red-700 border-red-200";
      case "high": return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
      case "low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "open": return "bg-orange-50 text-orange-700 border-orange-200";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "closed": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-8 md:mb-12">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#242021] mb-2 tracking-tight">
              Assigned Tickets
            </h1>
            <p className="text-gray-600 text-base md:text-lg">Tickets assigned to you for resolution</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`p-4 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                filter === "all" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
              }`}
            >
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.all}</div>
              <div className="text-xs md:text-sm opacity-80">All Tickets</div>
            </button>

            <button
              onClick={() => setFilter("in_progress")}
              className={`p-4 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                filter === "in_progress" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
              }`}
            >
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.in_progress}</div>
              <div className="text-xs md:text-sm opacity-80">In Progress</div>
            </button>

            <button
              onClick={() => setFilter("resolved")}
              className={`p-4 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                filter === "resolved" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
              }`}
            >
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.resolved}</div>
              <div className="text-xs md:text-sm opacity-80">Resolved</div>
            </button>

            <button
              onClick={() => setFilter("open")}
              className={`p-4 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                filter === "open" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
              }`}
            >
              <div className="text-2xl md:text-3xl font-bold mb-1">{stats.open}</div>
              <div className="text-xs md:text-sm opacity-80">Open</div>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ticket title, client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 pl-14 pr-6 py-4 md:py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#242021] placeholder-gray-400 shadow-lg border border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#242021] mx-auto mb-4"></div>
              <p className="text-gray-500 text-xl font-medium">Loading tickets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-200">
              <AlertCircle size={56} className="mx-auto mb-4 text-red-300" />
              <p className="text-red-500 text-xl font-medium">{error}</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-200">
              <AlertCircle size={56} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-xl font-medium mb-2">No tickets found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any tickets assigned to you yet'
                }
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="group bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#242021]/20 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className={`hidden lg:block w-1.5 h-20 rounded-full bg-gradient-to-b ${getPriorityColor(ticket.priority)} flex-shrink-0`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-3">
                      <h3 className="text-xl md:text-2xl font-bold text-[#242021] group-hover:text-[#3a3537] transition-colors">
                        {ticket.title}
                      </h3>
                      <span className={`lg:hidden px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium capitalize border border-gray-200">
                        {ticket.category}
                      </span>
                      <span className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg font-semibold capitalize border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg font-semibold capitalize border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      {ticket.tags && ticket.tags.length > 0 && ticket.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                      {ticket.tags && ticket.tags.length > 2 && (
                        <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-medium border border-gray-200">
                          +{ticket.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-4 justify-between lg:justify-start">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.userId?.name || ticket.userId?.fullName || 'Unknown Client'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.userId?.email || ''}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {(ticket.userId?.name || ticket.userId?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => handleResolveTicket(ticket._id)}
                          disabled={resolvingTicket === ticket._id}
                          className={`p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 ${resolvingTicket === ticket._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Resolve Ticket"
                        >
                          {resolvingTicket === ticket._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Simple Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#ffd17a] mb-2">{selectedTicket.title}</h2>
                    <p className="text-[#ffd17a]/70 text-sm">Ticket #{selectedTicket._id} • Created {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-[#ffd17a]/70 hover:text-[#ffd17a] transition-colors p-2 hover:bg-white/10 rounded-xl"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <p className="p-4 bg-gray-50 rounded-xl text-gray-700 border border-gray-200">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold capitalize border ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <span className="inline-block px-4 py-2 rounded-xl text-sm font-semibold capitalize bg-gray-100 text-gray-700 border border-gray-200">
                        {selectedTicket.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold capitalize border ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client Information</label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {(selectedTicket.userId?.name || selectedTicket.userId?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{selectedTicket.userId?.name || selectedTicket.userId?.fullName || 'Unknown Client'}</div>
                        <div className="text-sm text-gray-600">{selectedTicket.userId?.email || ''}</div>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'in_progress' && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleResolveTicket(selectedTicket._id)}
                        disabled={resolvingTicket === selectedTicket._id}
                        className={`w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2`}
                      >
                        {resolvingTicket === selectedTicket._id ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Resolve Ticket
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


