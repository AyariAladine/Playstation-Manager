"use client";
import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  async function generatePDF() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/reports/revenue?month=${selectedMonth}&year=${selectedYear}`);
      const { sessions, dailyRevenue, monthlyRevenue, totalRevenue, topGames } = res.data;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const monthName = months.find((m) => m.value === selectedMonth)?.label;

      // Header with gradient-like effect
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("PlayStation Shop", pageWidth / 2, 15, { align: "center" });
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Revenue Report", pageWidth / 2, 25, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`${monthName} ${selectedYear}`, pageWidth / 2, 33, { align: "center" });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Summary Box
      let yPos = 50;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, "F");
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("Monthly Summary", 20, yPos + 10);
      
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text(`${totalRevenue.toFixed(2)} DT`, pageWidth - 20, yPos + 12, { align: "right" });
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Total Sessions: ${sessions.length}`, 20, yPos + 23);
      doc.text(`Period: ${monthName} 1 - ${monthName} ${new Date(selectedYear, selectedMonth, 0).getDate()}`, 20, yPos + 31);

      yPos += 50;

      // Daily Revenue Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Daily Revenue Breakdown", 15, yPos);
      yPos += 5;

      const dailyData = Object.entries(dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => {
          const d = new Date(date);
          return [
            d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            `${(revenue as number).toFixed(2)} DT`,
          ];
        });

      autoTable(doc, {
        startY: yPos,
        head: [["Date", "Revenue"]],
        body: dailyData,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: "right", cellWidth: 80 },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Sessions Detail Table
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Player Revenue Summary", 15, yPos);
      yPos += 5;

      // Group sessions by player and sum their revenue
      const playerRevenue: { [key: string]: { name: string; sessions: number; totalRevenue: number; totalDuration: number } } = {};
      
      sessions.forEach((s: any) => {
        const playerName = s.player?.name || "Unknown";
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
        
        if (!playerRevenue[playerName]) {
          playerRevenue[playerName] = { name: playerName, sessions: 0, totalRevenue: 0, totalDuration: 0 };
        }
        
        playerRevenue[playerName].sessions += 1;
        playerRevenue[playerName].totalRevenue += s.totalPrice;
        playerRevenue[playerName].totalDuration += duration;
      });

      const sessionData = Object.values(playerRevenue)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .map((p) => [
          p.name,
          p.sessions.toString(),
          `${Math.floor(p.totalDuration / 60)}h ${p.totalDuration % 60}m`,
          `${(p.totalRevenue / p.sessions).toFixed(2)} DT`,
          `${p.totalRevenue.toFixed(2)} DT`,
        ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Player", "Sessions", "Total Time", "Avg Price", "Total Revenue"]],
        body: sessionData,
        theme: "striped",
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255],
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 35, halign: "right" },
          4: { cellWidth: 40, halign: "right", fontStyle: "bold" },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Top 20 Selling Games Table
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Top 20 Best Selling Games", 15, yPos);
      yPos += 5;

      const topGamesData = topGames.slice(0, 20).map((game: any, index: number) => [
        (index + 1).toString(),
        game.title,
        game.sessions.toString(),
        `${game.revenue.toFixed(2)} DT`,
        `${(game.revenue / game.sessions).toFixed(2)} DT`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Rank", "Game Title", "Sessions", "Total Revenue", "Avg/Session"]],
        body: topGamesData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244],
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 70 },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 35, halign: "right", fontStyle: "bold" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 15, right: 15 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`PlayStation-Shop-Revenue-${monthName}-${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  async function generateYearlyPDF() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/reports/revenue?year=${selectedYear}`);
      const { sessions, monthlyRevenue, totalRevenue, topGames } = res.data;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("PlayStation Shop", pageWidth / 2, 15, { align: "center" });
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Annual Revenue Report", pageWidth / 2, 25, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Year ${selectedYear}`, pageWidth / 2, 33, { align: "center" });

      doc.setTextColor(0, 0, 0);

      // Summary Box
      let yPos = 50;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, "F");
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("Annual Summary", 20, yPos + 10);
      
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text(`${totalRevenue.toFixed(2)} DT`, pageWidth - 20, yPos + 12, { align: "right" });
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Total Sessions: ${sessions.length}`, 20, yPos + 23);
      doc.text(`Period: January 1 - December 31, ${selectedYear}`, 20, yPos + 31);

      yPos += 50;

      // Monthly Revenue Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Monthly Revenue Breakdown", 15, yPos);
      yPos += 5;

      const monthlyData = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, revenue]) => {
          const [year, month] = monthKey.split("-");
          const monthName = months[parseInt(month) - 1]?.label;
          return [monthName, `${(revenue as number).toFixed(2)} DT`];
        });

      autoTable(doc, {
        startY: yPos,
        head: [["Month", "Revenue"]],
        body: monthlyData,
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: "right", cellWidth: 80 },
        },
        margin: { left: 15, right: 15 },
      });

      let yPos2 = (doc as any).lastAutoTable.finalY + 15;

      // Top 20 Selling Games Table
      if (yPos2 > 200) {
        doc.addPage();
        yPos2 = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Top 20 Best Selling Games", 15, yPos2);
      yPos2 += 5;

      const topGamesData = topGames.slice(0, 20).map((game: any, index: number) => [
        (index + 1).toString(),
        game.title,
        game.sessions.toString(),
        `${game.revenue.toFixed(2)} DT`,
        `${(game.revenue / game.sessions).toFixed(2)} DT`,
      ]);

      autoTable(doc, {
        startY: yPos2,
        head: [["Rank", "Game Title", "Sessions", "Total Revenue", "Avg/Session"]],
        body: topGamesData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244],
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 70 },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 35, halign: "right", fontStyle: "bold" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 15, right: 15 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`PlayStation-Shop-Annual-Revenue-${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl mb-6">
        <h1 className="text-3xl font-bold mb-2">Revenue Reports</h1>
        <p className="text-white/90">Generate and export detailed revenue reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Report Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly Report</h2>
              <p className="text-sm text-gray-600">Export monthly revenue breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generatePDF}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Export Monthly Report</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-800">
              <div className="font-semibold mb-1">Report includes:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Daily revenue breakdown</li>
                <li>Player revenue summary (grouped by player)</li>
                <li>Average price per session by player</li>
                <li>Total play time per player</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Annual Report Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              📈
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Annual Report</h2>
              <p className="text-sm text-gray-600">Export yearly revenue summary</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateYearlyPDF}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed mt-[52px]"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Export Annual Report</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-800">
              <div className="font-semibold mb-1">Report includes:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Monthly revenue breakdown</li>
                <li>Total annual revenue summary</li>
                <li>Year-over-year comparison data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-gray-900">📄 Report Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-2">🎨</div>
            <div className="font-semibold text-gray-900 mb-1">Professional Design</div>
            <div className="text-xs text-gray-600">Clean, branded PDF with color-coded sections</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-gray-900 mb-1">Detailed Tables</div>
            <div className="text-xs text-gray-600">Daily/monthly revenue with session breakdowns</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl mb-2">💾</div>
            <div className="font-semibold text-gray-900 mb-1">Auto-Download</div>
            <div className="text-xs text-gray-600">PDF automatically downloads to your device</div>
          </div>
        </div>
      </div>
    </div>
  );
}
