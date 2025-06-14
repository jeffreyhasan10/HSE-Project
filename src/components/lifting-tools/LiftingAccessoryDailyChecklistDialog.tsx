import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, MessageSquare, CheckCircle2 } from "lucide-react";
import type { LiftingAccessory } from "@/types/lifting-tools";
import type { DailyInspection } from "@/types/inspection";
import { cn } from "@/lib/utils";

// Define the inspection items with their respective images and bilingual descriptions
const INSPECTION_ITEMS = [
  {
    id: "fire-extinguisher",
    image: "/images/fire.png",
    title: "Fire Extinguisher",
    description: "Fire extinguisher available",
    titleAr: "طفاية الحريق",
    descriptionAr: "طفاية الحريق متوفرة",
  },
  {
    id: "first-aid",
    image: "/images/firstaid.png",
    title: "First Aid Box",
    description: "First aid box available",
    titleAr: "صندوق الإسعافات الأولية",
    descriptionAr: "صندوق الإسعافات الأولية متوفر",
  },
  {
    id: "oil-check",
    image: "/images/checkoil.png",
    title: "Oil Check",
    description: "Check oil level, no oil leak observed",
    titleAr: "فحص الزيت",
    descriptionAr: "فحص مستوى الزيت، لا يوجد تسرب للزيت",
  },
  {
    id: "windshield",
    image: "/images/windshield.png",
    title: "Windshield",
    description: "Windshield is clean and free from damages",
    titleAr: "الزجاج الأمامي",
    descriptionAr: "الزجاج الأمامي نظيف وخالي من الأضرار",
  },
  {
    id: "lights",
    image: "/images/headlights.png",
    title: "Lights",
    description: "Head lights, Indicator lights, break lights are operational",
    titleAr: "الأضواء",
    descriptionAr: "المصابيح الأمامية، إشارات الانعطاف، أضواء الفرامل تعمل",
  },
  {
    id: "tires",
    image: "/images/tirecondition.png",
    title: "Tire Condition",
    description: "Tyre condition – FRONT tyre / REAR tyre",
    titleAr: "حالة الإطارات",
    descriptionAr: "حالة الإطارات - الإطارات الأمامية / الخلفية",
  },
  {
    id: "cabin",
    image: "/images/closedcabin.png",
    title: "Cabin",
    description: "Closed cabin and Air Conditioning is working",
    titleAr: "المقصورة",
    descriptionAr: "المقصورة مغلقة ونظام التكييف يعمل",
  },
  {
    id: "reverse-alarm",
    image: "/images/reversealarm.png",
    title: "Reverse Alarm",
    description: "Reverse alarm, horn, mirrors are operational",
    titleAr: "إنذار الرجوع للخلف",
    descriptionAr: "إنذار الرجوع للخلف، البوق، المرايا تعمل",
  },
  {
    id: "hoses",
    image: "/images/housepipes.png",
    title: "Hoses & Pipes",
    description: "Hoses & pipe joints are in good condition",
    titleAr: "الخراطيم والأنابيب",
    descriptionAr: "الخراطيم ووصلات الأنابيب في حالة جيدة",
  },
  {
    id: "bucket",
    image: "/images/conditinofbucket.png",
    title: "Bucket Condition",
    description: "Condition of buckets (teeth protected)",
    titleAr: "حالة الدلو",
    descriptionAr: "حالة الدلاء (الأسنان محمية)",
  },
];

interface Props {
  accessory: LiftingAccessory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (inspection: DailyInspection) => Promise<void>;
}

export function LiftingAccessoryDailyChecklistDialog({
  accessory,
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  // Add early return if accessory is null
  if (!accessory || !open) return null;

  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, {
    status?: 'passed' | 'failed';
    comment: string;
  }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showNextInsteadOfNo, setShowNextInsteadOfNo] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const currentItem = INSPECTION_ITEMS[currentStep];

  const handleResponse = (status: 'passed' | 'failed') => {
    setResponses(prev => ({
      ...prev,
      [currentItem.id]: {
        status,
        comment: prev[currentItem.id]?.comment || ''
      }
    }));

    if (status === 'failed') {
      setShowNextInsteadOfNo(true);
      setShowCommentBox(true);
    } else if (status === 'passed' && currentStep < INSPECTION_ITEMS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowNextInsteadOfNo(false);
      setShowCommentBox(false);
    }
  };

  const handleComment = (comment: string) => {
    setResponses(prev => ({
      ...prev,
      [currentItem.id]: {
        status: prev[currentItem.id]?.status,
        comment
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < INSPECTION_ITEMS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowNextInsteadOfNo(false);
      setShowCommentBox(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowNextInsteadOfNo(false);
      setShowCommentBox(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const inspection: DailyInspection = {
        date: new Date().toISOString(),
        operatorId: 'current-user-id',
        operatorName: 'Current Operator',
        toolName: accessory.accessoryName,
        equipmentId: accessory.accessoryId,
        serialNumber: accessory.accessoryId,
        manufacturer: accessory.manufacturer,
        modelNumber: accessory.modelNumber,
        items: Object.entries(responses).map(([id, response]) => ({
          id,
          description: INSPECTION_ITEMS.find(item => item.id === id)?.description || '',
          status: response.status,
          comment: response.comment,
          isRequired: true
        })),
        notes: '',
        status: 'completed'
      };

      await onSubmit(inspection);
      onOpenChange(false);
      setCurrentStep(0);
      setResponses({});
      setShowNextInsteadOfNo(false);
      setShowCommentBox(false);
    } catch (err) {
      setError(isRTL 
        ? 'حدث خطأ أثناء حفظ قائمة التحقق'
        : 'An error occurred while saving the checklist'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "قائمة التحقق اليومية لملحقات الرفع" : "Lifting Accessory Daily Inspection"}
            <span className="text-sm text-muted-foreground ml-2">
              {currentStep + 1} / {INSPECTION_ITEMS.length}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? "قم بفحص كل عنصر وحدد ما إذا كان يجتاز الفحص أم لا"
              : "Check each item and indicate whether it passes inspection or not"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Accessory Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {isRTL ? "الملحق:" : "Accessory:"}
                </span>
                <span className="font-medium ml-2">{accessory.accessoryName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {isRTL ? "رقم الملحق:" : "Accessory ID:"}
                </span>
                <span className="font-medium ml-2">{accessory.accessoryId}</span>
              </div>
            </div>
          </div>

          {/* Inspection Item */}
          <div className="text-center space-y-4">
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="mx-auto h-48 object-contain"
            />
            <div>
              <h3 className="text-lg font-semibold">
                {isRTL ? currentItem.titleAr : currentItem.title}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? currentItem.descriptionAr : currentItem.description}
              </p>
            </div>
          </div>

          {/* Response Buttons */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={responses[currentItem.id]?.status === 'passed' ? 'default' : 'outline'}
                className={cn("w-32", responses[currentItem.id]?.status === 'passed' && "bg-green-600")}
                onClick={() => handleResponse('passed')}
              >
                {isRTL ? "نعم" : "Yes"}
              </Button>
              {showNextInsteadOfNo ? (
                <Button
                  variant="outline"
                  className="w-32"
                  onClick={handleNext}
                >
                  {isRTL ? "التالي" : "Next"}
                </Button>
              ) : (
                <>
                  <Button
                    variant={responses[currentItem.id]?.status === 'failed' ? 'destructive' : 'outline'}
                    className="w-32"
                    onClick={() => handleResponse('failed')}
                  >
                    {isRTL ? "لا" : "No"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-32"
                    onClick={() => setShowCommentBox(true)}
                  >
                    {isRTL ? "تعليق" : "Comment"}
                  </Button>
                </>
              )}
            </div>

            {/* Comment Box */}
            {showCommentBox && (
              <div className="space-y-2">
                <Textarea
                  placeholder={isRTL ? "أضف تعليقًا..." : "Add a comment..."}
                  value={responses[currentItem.id]?.comment || ''}
                  onChange={(e) => handleComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {isRTL ? "السابق" : "Previous"}
            </Button>
            {currentStep === INSPECTION_ITEMS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(responses).length !== INSPECTION_ITEMS.length}
              >
                {isRTL ? "إنهاء الفحص" : "Complete Inspection"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!responses[currentItem.id]}
              >
                {isRTL ? "التالي" : "Next"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}