"use client";
import { useState, useEffect } from "react";
import { Plus, X, Search, Clock, CheckCircle, AlertCircle, ChevronRight, Zap } from "lucide-react";
import { createTicket, getTicketsByUserId } from "../../../services/ticketService";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../i18n/TranslationContext";


export default function TicketSystem() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    tags: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      // Send form data to backend
      const newTicket = await createTicket({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      });
  
      // Add the ticket returned from backend to state
      setTickets([newTicket.ticket, ...tickets]);
  
      setMessage("Ticket created successfully!");
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "general",
        tags: "",
      });
  
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!user) return; // wait for user to be loaded

    const fetchTickets = async () => {
      try {
        const res = await getTicketsByUserId(user.id);
        setTickets(res.tickets); // assuming response has tickets array
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets();
  }, [user]);
  

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    all: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#242021] mb-2 tracking-tight">
                {t('support.title')}
              </h1>
              <p className="text-gray-600 text-base md:text-lg">{t('support.subtitle')}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] px-6 py-3 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>{t('support.newTicket')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <button
              onClick={() => setFilter("all")}
              className={`group relative overflow-hidden p-6 md:p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                filter === "all" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-2xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-200"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className='text-sm font-semibold uppercase tracking-wide opacity-80'>{t('support.allTickets')}</span>
                  <div className={`p-2 rounded-xl ${filter === "all" ? "bg-[#ffd17a]/20" : "bg-gray-100"}`}>
                    <Zap size={18} />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1">{stats.all}</div>
                <div className='text-xs opacity-70'>{t('support.totalRequests')}</div>
              </div>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                filter === "all" ? "bg-gradient-to-br from-[#ffd17a]/10 to-transparent" : "bg-gradient-to-br from-blue-500/5 to-transparent"
              }`}></div>
            </button>
            
            <button
              onClick={() => setFilter("open")}
              className={`group relative overflow-hidden p-6 md:p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                filter === "open" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-2xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-200"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className='text-sm font-semibold uppercase tracking-wide opacity-80'>{t('support.open')}</span>
                  <div className={`p-2 rounded-xl ${filter === "open" ? "bg-[#ffd17a]/20" : "bg-orange-100"}`}>
                    <Clock size={18} className={filter === "open" ? "" : "text-orange-600"} />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1">{stats.open}</div>
                <div className='text-xs opacity-70'>{t('support.pendingAction')}</div>
              </div>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                filter === "open" ? "bg-gradient-to-br from-[#ffd17a]/10 to-transparent" : "bg-gradient-to-br from-orange-500/5 to-transparent"
              }`}></div>
            </button>
            
            <button
              onClick={() => setFilter("resolved")}
              className={`group relative overflow-hidden p-6 md:p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                filter === "resolved" 
                  ? "bg-gradient-to-br from-[#242021] to-[#3a3537] text-[#ffd17a] shadow-2xl" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-200"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className='text-sm font-semibold uppercase tracking-wide opacity-80'>{t('support.resolved')}</span>
                  <div className={`p-2 rounded-xl ${filter === "resolved" ? "bg-[#ffd17a]/20" : "bg-emerald-100"}`}>
                    <CheckCircle size={18} className={filter === "resolved" ? "" : "text-emerald-600"} />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1">{stats.resolved}</div>
                <div className='text-xs opacity-70'>{t('support.completed')}</div>
              </div>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                filter === "resolved" ? "bg-gradient-to-br from-[#ffd17a]/10 to-transparent" : "bg-gradient-to-br from-emerald-500/5 to-transparent"
              }`}></div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#242021] transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('support.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 pl-14 pr-6 py-4 md:py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#242021] placeholder-gray-400 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-200">
              <AlertCircle size={56} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-xl font-medium mb-2">{t('support.noTicketsFound')}</p>
              <p className="text-gray-400 text-sm">{t('support.adjustSearchFilters')}</p>
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
                      {ticket.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                      {ticket.tags.length > 2 && (
                        <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-medium border border-gray-200">
                          +{ticket.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-4 justify-between lg:justify-start">
                    {ticket.status === "open" ? (
                      <span className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg">
                        <Clock size={16} />
                        {t('support.open')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg">
                        <CheckCircle size={16} />
                        {t('support.resolved')}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span>{ticket.createdAt}</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#242021] to-[#3a3537] p-6 md:p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#ffd17a] mb-1">{t('support.createNewTicket')}</h2>
                  <p className="text-[#ffd17a]/70 text-sm">{t('support.getBackSoon')}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#ffd17a]/70 hover:text-[#ffd17a] transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {message && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className='block text-gray-700 font-semibold mb-2 text-sm'>{t('support.ticketTitle')}</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:bg-white placeholder-gray-400 transition-all"
                    placeholder={t('support.briefSummary')}
                  />
                </div>

                <div>
                  <label className='block text-gray-700 font-semibold mb-2 text-sm'>{t('support.description')}</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:bg-white placeholder-gray-400 resize-none transition-all"
                    placeholder={t('support.detailedInformation')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className='block text-gray-700 font-semibold mb-2 text-sm'>{t('support.priorityLevel')}</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:bg-white transition-all"
                    >
                      <option value='low'>{t('support.priority.low')}</option>
                      <option value='medium'>{t('support.priority.medium')}</option>
                      <option value='high'>{t('support.priority.high')}</option>
                      <option value='urgent'>{t('support.priority.urgent')}</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-gray-700 font-semibold mb-2 text-sm'>{t('support.categoryLabel')}</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:bg-white transition-all"
                    >
                      <option value='general'>{t('support.category.general')}</option>
                      <option value='application'>{t('support.category.application')}</option>
                      <option value='payment'>{t('support.category.payment')}</option>
                      <option value='document'>{t('support.category.document')}</option>
                      <option value='technical'>{t('support.category.technical')}</option>
                      <option value='billing'>{t('support.category.billing')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    {t('support.tags')} <span className='text-gray-400 font-normal'>({t('support.commaSeparated')})</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#242021] focus:bg-white placeholder-gray-400 transition-all"
                    placeholder={t('support.tagsPlaceholder')}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    {t('buttons.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#242021] to-[#3a3537] text-[#ffd17a] font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {loading ? t('support.creating') : t('support.createTicket')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}