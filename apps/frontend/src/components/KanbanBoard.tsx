import React from "react";
import { Calendar, MessageSquare, Paperclip, Move } from "lucide-react";

interface KanbanProps {
  isShowing: boolean;
}

export function KanbanBoard({ isShowing }: KanbanProps) {
  return (
    <div className="grid grid-cols-4 gap-4 items-start select-none">
      {/* ======================================================== */}
      {/* COLUMN 1: TO DO (12) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="font-bold text-sm text-[#111827]">To Do</span>
          <span className="text-gray-500 text-sm">(12)</span>
        </div>

        {/* Card 1.1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDE8E4] text-[#E15B46] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dribbble</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Project Management Web App</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Make a design for a web application for organizing the workspace of an IT company</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>30 Jan</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">ZM</div>
              <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">RY</div>
              <div className="w-5 h-5 rounded-full bg-[#FF7A29] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">+3</div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 2</span>
              <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 1</span>
            </div>
          </div>
        </div>

        {/* Card 1.2 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#E0F2FE] text-[#0284C7] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Behance</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Neobank App Case</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-3">It should include wireframes, user flows, and visual design elements demonstrating modern banking</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>5 Feb</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">IB</div>
              <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">VD</div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 8</span>
              <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 3</span>
            </div>
          </div>
        </div>

        {/* Card 1.3 (With Mini Wireframe Box) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
            <span className="bg-[#E0F7F4] text-[#0D9488] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dev</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Design Agency Website</h4>
            <p className="text-[11px] text-gray-500 mt-1">Responsive performance across devices.</p>
          </div>
          {/* Wireframe Mockup Preview */}
          <div className="bg-[#111827] rounded-xl p-2.5 space-y-1.5">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex gap-1.5">
              <div className="w-2/3 bg-[#1F2937] rounded-md h-8 p-1 flex flex-col justify-between">
                <div className="w-8 h-1 bg-[#FF7A29] rounded" />
                <div className="w-16 h-1 bg-gray-600 rounded" />
              </div>
              <div className="w-1/3 bg-[#374151] rounded-md h-8" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>14 Feb</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">KM</div>
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">ZM</div>
            </div>
            <span className="flex items-center gap-0.5 text-gray-400 text-[11px]"><MessageSquare className="w-3 h-3" /> 4</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 2: IN PROGRESS (2) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="font-bold text-sm text-[#111827]">In Progress</span>
          <span className="text-gray-500 text-sm">(2)</span>
        </div>

        {/* Card 2.1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDE8E4] text-[#E15B46] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dribbble</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Speaking App</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Create mobile app for language exchange to help users practice.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>30 Jan</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">ZM</div>
              <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">RY</div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 6</span>
              <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 2</span>
            </div>
          </div>
        </div>

        {/* ACTIVE DRAG STATE: Placeholder Slot + Elevated Hover Card */}
        <div className="relative">
          {/* Dashed slot underneath */}
          <div className="h-44 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#FAFAFA]" />

          {/* Elevated hovering dragged card */}
          <div className="absolute top-3 left-3 right--2 bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xl transition space-y-2.5 rotate-[0.5deg]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-[#E0F7F4] text-[#0D9488] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dev</span>
                <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
              </div>
              <Move className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900 leading-tight">Online Catalog Development</h4>
              <p className="text-[11px] text-gray-600 mt-1 line-clamp-3">Develop employee directory index supporting 50,000+ employees with zero caching lag.</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>3 Feb</span>
              </div>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">ZM</div>
                <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">RY</div>
                <div className="w-5 h-5 rounded-full bg-[#FF7A29] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">+3</div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 4</span>
                <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 3: REVIEW (3) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="font-bold text-sm text-[#111827]">Review</span>
          <span className="text-gray-500 text-sm">(3)</span>
        </div>

        {/* Card 3.1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#F3E8FF] text-[#7E22CE] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Research</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Administrator Panel Interface</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Manage user rights across multi-tenant environments.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>24 Jan</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">IB</div>
              <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">VD</div>
              <div className="w-5 h-5 rounded-full bg-[#FF7A29] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">+2</div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 3</span>
              <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 1</span>
            </div>
          </div>
        </div>

        {/* Card 3.2 (With Triple Phone Mockup Preview!) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Fintech App</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Intuitive visual design simplifying complex financial transactions.</p>
          </div>
          {/* Triple Mobile Screens Mockup */}
          <div className="bg-[#141519] rounded-xl p-2 flex gap-1.5 justify-between">
            <div className="w-1/3 bg-[#1E2026] border border-[#2E313B] rounded-lg p-1.5 h-16 flex flex-col justify-between">
              <div className="w-5 h-1 bg-[#FF7A29] rounded" />
              <div className="w-full h-3 bg-[#282B34] rounded" />
              <div className="w-full h-1 bg-[#FF6C22] rounded" />
            </div>
            <div className="w-1/3 bg-[#1E2026] border border-[#2E313B] rounded-lg p-1.5 h-16 flex flex-col justify-between">
              <div className="w-4 h-1 bg-blue-500 rounded" />
              <div className="w-full h-2.5 bg-[#282B34] rounded" />
              <div className="w-full h-4 bg-[#282B34] rounded" />
            </div>
            <div className="w-1/3 bg-[#1E2026] border border-[#2E313B] rounded-lg p-1.5 h-16 flex flex-col justify-between">
              <div className="w-5 h-1 bg-emerald-500 rounded" />
              <div className="w-full h-2 bg-[#282B34] rounded" />
              <div className="w-full h-2 bg-[#282B34] rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>23 Jan</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">ZM</div>
              <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">RY</div>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">IB</div>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> 5</span>
              <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 4: COMPLETE (26) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="font-bold text-sm text-[#111827]">Complete</span>
          <span className="text-gray-500 text-sm">(26)</span>
        </div>

        {/* Card 4.1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDE8E4] text-[#E15B46] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dribbble</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Finance Manager</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Workspace organization dashboard for IT companies.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>12 Jan</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">ZM</div>
          </div>
        </div>

        {/* Card 4.2 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#F3E8FF] text-[#7E22CE] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Research</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Fashion Website</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">Luxurious editorial craftsmanship and micro-interactions.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>9 Jan</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">IB</div>
              <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">VD</div>
              <div className="w-5 h-5 rounded-full bg-[#FF7A29] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">+2</div>
            </div>
          </div>
        </div>

        {/* Card 4.3 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDE8E4] text-[#E15B46] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Dribbble</span>
            <span className="bg-[#FEF0E6] text-[#D97706] text-[11px] font-semibold px-2.5 py-0.5 rounded-md">Design</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 leading-tight">Note-Taking App</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">High-velocity interface for rapid idea capture.</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>4 Jan</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">RY</div>
          </div>
        </div>
      </div>
    </div>
  );
}
