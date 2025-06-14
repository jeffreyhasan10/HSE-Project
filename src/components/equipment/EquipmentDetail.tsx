import { useState } from "react";
import { Equipment, getDaysUntilNextInspection } from "@/types/equipment";
import { DailyInspection, MonthlyInspection } from "@/types/inspection";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";
import { ComplianceMeter } from "./ComplianceMeter";
import { DocumentList } from "./DocumentList";
import { DailyChecklistDialog } from "./DailyChecklistDialog";
import { MonthlyInspectionDialog } from "./MonthlyInspectionDialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  Calendar, 
  Clipboard, 
  History, 
  MapPin, 
  User, 
  Tag, 
  Edit, 
  Save, 
  X, 
  Upload, 
  FileText, 
  Eye, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentType, DocumentStatus } from "@/types/equipment";

interface EquipmentDetailProps {
  equipment: Equipment;
  className?: string;
  onBack?: () => void;
  onUpdateInspection?: (inspection: DailyInspection | MonthlyInspection) => Promise<void>;
}

export function EquipmentDetail({ 
  equipment, 
  className, 
  onBack,
  onUpdateInspection 
}: EquipmentDetailProps) {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState(equipment);
  const [newNote, setNewNote] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isDailyChecklistOpen, setIsDailyChecklistOpen] = useState(false);
  const [isMonthlyChecklistOpen, setIsMonthlyChecklistOpen] = useState(false);
  const daysToInspection = getDaysUntilNextInspection(equipment.nextInspectionDate);

  // Check if there's a daily inspection for today
  const today = new Date().toISOString().split('T')[0];
  const todaysInspection = equipment.dailyInspections?.find(
    inspection => inspection.date.split('T')[0] === today
  );
  const hasPassedTodaysInspection = todaysInspection?.status === 'completed';

  // Check monthly inspection status
  const lastMonthlyInspection = equipment.monthlyInspections?.[0];
  const isMonthlyInspectionDue = !lastMonthlyInspection || 
    new Date(lastMonthlyInspection.nextInspectionDate) <= new Date();

  const handleInspectionSubmit = async (inspection: DailyInspection | MonthlyInspection) => {
    if (onUpdateInspection) {
      await onUpdateInspection(inspection);
    }
  };

  const documentStatuses = {
    verified: equipment.documents.filter(doc => doc.status === 'verified').length,
    pending: equipment.documents.filter(doc => doc.status === 'pending').length,
    rejected: equipment.documents.filter(doc => doc.status === 'rejected').length,
  };

  const documentStatusData = [
    { name: isRTL ? "موثق" : "Verified", value: documentStatuses.verified, color: 'var(--status-valid)' },
    { name: isRTL ? "معلق" : "Pending", value: documentStatuses.pending, color: 'var(--status-warning)' },
    { name: isRTL ? "مرفوض" : "Rejected", value: documentStatuses.rejected, color: 'var(--status-expired)' },
  ].filter(entry => entry.value > 0);

  // --- Inject sample document if not present ---
  const sampleDocument = {
    id: "sample-vendor-pdf",
    name: "Vendor List Version 2.pdf",
    type: "manual" as DocumentType,
    status: "verified" as DocumentStatus,
    issueDate: "2024-01-01",
    expiryDate: "2025-01-01",
    issuedBy: "Vendor Department",
    fileUrl: "/lovable-uploads/Vendor List Version 2.pdf",
  };
  const documentsWithSample = equipment.documents.some(doc => doc.id === sampleDocument.id)
    ? equipment.documents
    : [sampleDocument, ...equipment.documents];
  // --- Mock history and maintenance data ---
  const mockHistory = [
    { date: "2024-03-01", event: "Inspection completed", by: "Inspector A" },
    { date: "2024-02-15", event: "Assigned to John Doe", by: "System" },
    { date: "2024-01-10", event: "Status changed to Active", by: "Admin" },
  ];
  const mockMaintenance = [
    { date: "2024-04-10", action: "Oil Change", by: "Tech B", status: "Completed" },
    { date: "2024-03-20", action: "Filter Replacement", by: "Tech C", status: "Completed" },
    { date: "2024-02-05", action: "Scheduled Maintenance", by: "Tech D", status: "Scheduled" },
  ];

  const handleSave = () => {
    // Implement save logic here
    setIsEditing(false);
    // You would typically call an API to update the equipment
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Add note logic here
      setNewNote("");
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle document upload
    const file = event.target.files?.[0];
    // Implement upload logic
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Back Button and Edit Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isRTL ? "رجوع" : "Back"}
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground">{equipment.model} • {equipment.serialNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {isRTL ? "حفظ" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {isRTL ? "تعديل" : "Edit"}
            </Button>
          )}
        </div>
      </div>
      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "ملاحظات الفحص" : "Inspection Notes"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder={isRTL ? "أضف ملاحظة..." : "Add a note..."}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddNote}>
                {isRTL ? "إضافة" : "Add"}
              </Button>
            </div>
            {/* Display existing notes */}
          </div>
        </CardContent>
      </Card>
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pb-2">
            <CardTitle className="text-base">{isRTL ? "تفاصيل المعدات" : "Equipment Details"}</CardTitle>
            <CardDescription>
              {isRTL ? "معلومات أساسية عن المعدات" : "Basic information about the equipment"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isRTL ? "الرقم التسلسلي:" : "Serial Number:"}</span>
                <span className="text-sm font-medium">{equipment.serialNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isRTL ? "تاريخ الشراء:" : "Purchase Date:"}</span>
                <span className="text-sm font-medium">
                  {new Date(equipment.purchaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isRTL ? "الموقع:" : "Location:"}</span>
                <span className="text-sm font-medium">{equipment.location || (isRTL ? 'غير محدد' : 'Not specified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isRTL ? "مخصص لـ:" : "Assigned To:"}</span>
                <span className="text-sm font-medium">{equipment.assignedTo || (isRTL ? 'غير مخصص' : 'Not assigned')}</span>
              </div>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isRTL ? "الفحص القادم:" : "Next Inspection:"}</span>
                <span className="text-sm font-medium">
                  {new Date(equipment.nextInspectionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pb-2">
            <CardTitle className="text-base">{isRTL ? "حالة الامتثال" : "Compliance Status"}</CardTitle>
            <CardDescription>
              {isRTL ? "نظرة عامة على الامتثال" : "Overview of compliance status"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <ComplianceMeter
                score={equipment.complianceScore}
                daysToNextInspection={daysToInspection}
                size="lg"
              />
              <div className="text-sm">
                <Clipboard className="h-4 w-4 inline-block mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">{isRTL ? "ملاحظات:" : "Notes:"} </span>
                <span>{equipment.notes || (isRTL ? 'لا توجد ملاحظات متاحة' : 'No notes available')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pb-2">
            <CardTitle className="text-base">{isRTL ? "حالة الوثائق" : "Document Status"}</CardTitle>
            <CardDescription>
              {isRTL ? "توزيع حالات الوثائق" : "Distribution of document statuses"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {documentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">{isRTL ? "إجمالي الوثائق:" : "Total Documents:"} </span>
              <span className="font-medium">{equipment.documents.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily and Monthly Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Inspection Card */}
        <Card className="border-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isRTL ? "الفحص اليومي" : "Daily Inspection"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "حالة الفحص اليومي" : "Daily operator inspection status"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasPassedTodaysInspection ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {isRTL ? "تم إجراء الفحص اليوم" : "Inspection completed today"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      {isRTL ? "لم يتم إجراء الفحص اليوم" : "Inspection needed today"}
                    </span>
                  </>
                )}
              </div>
              <Button 
                variant={hasPassedTodaysInspection ? "outline" : "default"}
                onClick={() => setIsDailyChecklistOpen(true)}
              >
                {hasPassedTodaysInspection ? (
                  isRTL ? "عرض التفاصيل" : "View Details"
                ) : (
                  isRTL ? "بدء الفحص" : "Start Inspection"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Technical Inspection Card */}
        <Card className="border-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {isRTL ? "الفحص الفني الشهري" : "Monthly Technical Inspection"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "حالة الفحص الفني الشهري" : "Monthly technical inspection status"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMonthlyInspectionDue ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-yellow-600">
                        {isRTL ? "الفحص الفني مطلوب" : "Technical inspection due"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lastMonthlyInspection ? (
                          isRTL 
                            ? `آخر فحص: ${new Date(lastMonthlyInspection.date).toLocaleDateString()}`
                            : `Last inspection: ${new Date(lastMonthlyInspection.date).toLocaleDateString()}`
                        ) : (
                          isRTL ? "لم يتم إجراء فحص سابق" : "No previous inspection"
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-green-600">
                        {isRTL ? "الفحص الفني حديث" : "Technical inspection up to date"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL 
                          ? `الفحص القادم: ${new Date(lastMonthlyInspection!.nextInspectionDate).toLocaleDateString()}`
                          : `Next due: ${new Date(lastMonthlyInspection!.nextInspectionDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Button 
                variant={isMonthlyInspectionDue ? "default" : "outline"}
                onClick={() => setIsMonthlyChecklistOpen(true)}
              >
                {isMonthlyInspectionDue ? (
                  isRTL ? "إجراء الفحص" : "Perform Inspection"
                ) : (
                  isRTL ? "عرض السجل" : "View History"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the existing content... */}
      
      {/* Update the History tab to include inspections */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
          <TabsTrigger value="documents">
            {isRTL ? "الوثائق" : "Documents"}
          </TabsTrigger>
          <TabsTrigger value="history">
            {isRTL ? "السجل" : "History"}
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            {isRTL ? "الصيانة" : "Maintenance"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <DocumentList documents={documentsWithSample} />
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Daily Inspections Section */}
                <div>
                  <h3 className="font-medium text-lg mb-4">
                    {isRTL ? "سجل الفحص اليومي" : "Daily Inspection History"}
                  </h3>
                  <div className="space-y-2">
                    {equipment.dailyInspections?.slice(0, 5).map((inspection, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">
                            {isRTL ? "الفحص اليومي" : "Daily Inspection"}
                          </span>
                          <div className="text-muted-foreground">
                            {isRTL ? "بواسطة: " : "By: "}{inspection.operatorName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>{new Date(inspection.date).toLocaleDateString()}</div>
                          <Badge variant={inspection.status === 'completed' ? "default" : "secondary"}>
                            {inspection.status === 'completed' 
                              ? (isRTL ? "مكتمل" : "Completed")
                              : (isRTL ? "غير مكتمل" : "Incomplete")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Inspections Section */}
                <div>
                  <h3 className="font-medium text-lg mb-4">
                    {isRTL ? "سجل الفحص الفني" : "Technical Inspection History"}
                  </h3>
                  <div className="space-y-2">
                    {equipment.monthlyInspections?.slice(0, 5).map((inspection, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">
                            {isRTL ? "الفحص الفني" : "Technical Inspection"}
                          </span>
                          <div className="text-muted-foreground">
                            {isRTL ? "بواسطة: " : "By: "}{inspection.technicianName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "الفحص القادم: " : "Next due: "}
                            {new Date(inspection.nextInspectionDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>{new Date(inspection.date).toLocaleDateString()}</div>
                          <Badge variant={inspection.status === 'completed' ? "default" : "secondary"}>
                            {inspection.status === 'completed'
                              ? (isRTL ? "مكتمل" : "Completed")
                              : (isRTL ? "غير مكتمل" : "Incomplete")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General History Events */}
                <div>
                  <h3 className="font-medium text-lg mb-4">
                    {isRTL ? "السجل العام" : "General History"}
                  </h3>
                  <div className="space-y-2">
                    {mockHistory.map((h, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{h.event}</span>
                        <span className="text-muted-foreground">{h.date} — {h.by}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-2">
                {mockMaintenance.map((m, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">{m.action}</span>
                    <span className="text-muted-foreground">{m.date} — {m.by} — {m.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inspection Dialogs */}
      <DailyChecklistDialog
        equipment={equipment}
        open={isDailyChecklistOpen}
        onOpenChange={setIsDailyChecklistOpen}
        onSubmit={handleInspectionSubmit}
      />
      
      <MonthlyInspectionDialog
        equipment={equipment}
        open={isMonthlyChecklistOpen}
        onOpenChange={setIsMonthlyChecklistOpen}
        onSubmit={handleInspectionSubmit}
      />
    </div>
  );
}