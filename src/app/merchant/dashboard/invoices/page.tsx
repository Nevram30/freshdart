"use client";

import { useState } from "react";
import {
  Download,
  Search,
  ChevronDown,
  Building2,
  AlertCircle,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Types
interface Invoice {
  id: string;
  invoiceNumber: string;
  producer: string;
  producerIcon: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "OVERDUE" | "PAID";
}

// Sample data
const sampleInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2023-8842",
    producer: "Nordic Fisheries Ltd.",
    producerIcon: "🏢",
    issueDate: "Oct 28, 2023",
    dueDate: "Nov 12, 2023",
    amount: 1240.0,
    status: "PENDING",
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-8715",
    producer: "Coastal Catch Co.",
    producerIcon: "🏢",
    issueDate: "Oct 20, 2023",
    dueDate: "Oct 27, 2023",
    amount: 850.5,
    status: "OVERDUE",
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-8692",
    producer: "Deep Sea Harvest",
    producerIcon: "⚓",
    issueDate: "Oct 15, 2023",
    dueDate: "Oct 30, 2023",
    amount: 2100.0,
    status: "PAID",
  },
  {
    id: "4",
    invoiceNumber: "INV-2023-8650",
    producer: "Global Reef Importers",
    producerIcon: "🏢",
    issueDate: "Oct 10, 2023",
    dueDate: "Oct 25, 2023",
    amount: 4520.0,
    status: "PAID",
  },
];

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);

  const outstandingBalance = 2840.5;
  const invoicesDue = 3;
  const totalPaidYTD = 42150.25;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoices and Billing
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your payments, view history, and handle pending bills.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Download All
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
              <DollarSign className="h-4 w-4" />
              Quick Pay Due
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Outstanding Balance */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Outstanding Balance
              </h3>
              <div className="rounded-lg bg-blue-50 p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">
              ${outstandingBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500">Next Due Nov 15</p>
          </div>

          {/* Invoices Due */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Invoices Due
              </h3>
              <div className="rounded-lg bg-amber-50 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mb-2 text-3xl font-bold text-amber-600">
              {String(invoicesDue).padStart(2, "0")}
            </div>
            <p className="text-xs text-gray-500">Unpaid Invoices</p>
          </div>

          {/* Total Paid (YTD) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Total Paid (YTD)
              </h3>
              <div className="rounded-lg bg-green-50 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mb-2 text-3xl font-bold text-gray-900">
              ${totalPaidYTD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500">Since Jan 2024</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
        </div>

        {/* Search and Filter */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Invoice ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Overdue</option>
                <option>Paid</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Producer/Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Issue Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-lg">{invoice.producerIcon}</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {invoice.producer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {invoice.issueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {invoice.dueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ${invoice.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase",
                        invoice.status === "PENDING" &&
                          "bg-blue-100 text-blue-700",
                        invoice.status === "OVERDUE" &&
                          "bg-amber-100 text-amber-700",
                        invoice.status === "PAID" && "bg-green-100 text-green-700"
                      )}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 transition-colors hover:text-gray-600">
                        <Download className="h-5 w-5" />
                      </button>
                      {invoice.status !== "PAID" && (
                        <button className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800">
                          Pay Now
                        </button>
                      )}
                      <button className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                        {invoice.status === "PAID" ? "View Details" : "Details"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-600">
            Showing 4 of 128 invoices
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-sm font-semibold text-white">
              1
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              2
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              3
            </button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
