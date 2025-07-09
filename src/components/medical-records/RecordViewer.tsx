import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Activity,
  Brain,
  Calendar,
  Download,
  Eye,
  FileText,
  Heart,
  Pill,
  Printer,
  Share,
  Shield,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface MedicalRecord {
  id: string;
  type: string;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  notes: string;
  createdAt: string;
  provider?: {
    user: {
      name: string;
    };
    specialization?: string;
  };
  patient?: {
    user: {
      name: string;
    };
  };
  attachments?: string[];
  status?: string;
}

interface RecordViewerProps {
  record: MedicalRecord;
  isOpen: boolean;
  onClose: () => void;
  userRole?: "PATIENT" | "DOCTOR" | "PROVIDER";
}

const RecordViewer: React.FC<RecordViewerProps> = ({
  record,
  isOpen,
  onClose,
  userRole = "PATIENT",
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const getRecordTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return <User className="h-5 w-5" />;
      case "prescription":
        return <Pill className="h-5 w-5" />;
      case "lab_result":
        return <Activity className="h-5 w-5" />;
      case "imaging":
        return <Eye className="h-5 w-5" />;
      case "surgery":
        return <Heart className="h-5 w-5" />;
      case "mental_health":
        return <Brain className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "prescription":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "lab_result":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "imaging":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "surgery":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "mental_health":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log("Downloading record:", record.id);
  };

  const handleShare = () => {
    setIsSharing(true);
    // In a real app, this would open a sharing dialog
    setTimeout(() => setIsSharing(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${getRecordTypeColor(record.type)}`}
              >
                {getRecordTypeIcon(record.type)}
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {record.diagnosis}
                </DialogTitle>
                <DialogDescription>
                  Medical Record •{" "}
                  {format(new Date(record.createdAt), "MMMM d, yyyy")}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Type and Status */}
          <div className="flex items-center gap-4">
            <Badge className={getRecordTypeColor(record.type)}>
              {getRecordTypeIcon(record.type)}
              <span className="ml-2 capitalize">
                {record.type.replace("_", " ")}
              </span>
            </Badge>
            {record.status && <Badge variant="outline">{record.status}</Badge>}
          </div>

          {/* Patient/Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRole !== "PATIENT" && record.patient && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Patient
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      {record.patient.user.name}
                    </div>
                  </div>
                )}

                {record.provider && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Healthcare Provider
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {record.provider.user.name}
                      </div>
                      {record.provider.specialization && (
                        <div className="text-sm text-muted-foreground ml-6">
                          {record.provider.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date Created
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(record.createdAt),
                      "EEEE, MMMM d, yyyy h:mm a"
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Record Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {getRecordTypeIcon(record.type)}
                    <span className="capitalize">
                      {record.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{record.diagnosis}</p>
            </CardContent>
          </Card>

          {/* Treatment */}
          {record.treatment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{record.treatment}</p>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {record.prescription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{record.prescription}</p>
              </CardContent>
            </Card>
          )}

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">
                {record.notes}
              </p>
            </CardContent>
          </Card>

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {record.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{attachment}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Shield className="h-4 w-4" />
                <span className="font-medium">
                  Protected Health Information
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This medical record contains protected health information and is
                confidential. Unauthorized access or disclosure is prohibited by
                law.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {userRole !== "PATIENT" && (
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share className="h-4 w-4 mr-2" />
                  {isSharing ? "Sharing..." : "Share"}
                </Button>
              )}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordViewer;
