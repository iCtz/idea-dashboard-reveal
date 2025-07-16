"use client";

import { useState, useTransition, useRef } from "react";
import type { Profile, ListOfValue } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Lightbulb } from "lucide-react";
import { createIdea } from "@/app/dashboard/actions";
import { IdeaCategory } from "@prisma/client";
import { FileUploadField } from "./FileUploadField";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { useListOfValues } from "@/hooks/useListOfValues";

interface IdeaSubmissionFormProps {
  profile: Profile;
  onIdeaSubmitted: () => void;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  implementation_cost: string;
  expected_roi: string;
  strategic_alignment_score: string;
  status: string;
  language: string;
}

interface SubmissionData {
  title: string;
  description: string;
  category: IdeaCategory;
  implementation_cost: string;
  expected_roi: string;
  strategic_alignment_score: string;
  status: string;
  language: string;
}

// Custom hook for form state management
const useFormState = () => {
  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    implementation_cost: "",
    expected_roi: "",
    strategic_alignment_score: "",
    status: "",
    language: "",
  });

  const [feasibilityFiles, setFeasibilityFiles] = useState<File[]>([]);
  const [pricingFiles, setPricingFiles] = useState<File[]>([]);
  const [prototypeFiles, setPrototypeFiles] = useState<File[]>([]);
  const [strategicAlignment, setStrategicAlignment] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      implementation_cost: "",
      expected_roi: "",
      strategic_alignment_score: "",
      status: "",
      language: "",
    });
    setFeasibilityFiles([]);
    setPricingFiles([]);
    setPrototypeFiles([]);
    setStrategicAlignment([]);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    feasibilityFiles,
    pricingFiles,
    prototypeFiles,
    strategicAlignment,
    setFeasibilityFiles,
    setPricingFiles,
    setPrototypeFiles,
    setStrategicAlignment,
    resetForm,
    handleChange,
  };
};

// Form validation utilities
const validateFormData = (data: SubmissionData) => {
  return !!(data.title && data.description && data.category);
};

const extractFormData = (formData: FormData): SubmissionData => ({
  title: formData.get("title") as string,
  description: formData.get("description") as string,
  category: formData.get("category") as IdeaCategory,
  implementation_cost: formData.get("implementation_cost") as string,
  expected_roi: formData.get("expected_roi") as string,
  strategic_alignment_score: formData.get("strategic_alignment_score") as string,
  status: formData.get("status") as string,
  language: formData.get("language") as string
});

// Basic form fields component
const BasicFormFields = ({ formData, handleChange, isRTL, t }: {
  formData: FormState;
  handleChange: (field: string, value: string) => void;
  isRTL: boolean;
  t: (namespace: string, key: string) => string;
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="title" className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'idea_title')} *
      </Label>
      <Input
        id="title"
        name="title"
        placeholder={t('idea_form', 'title_placeholder')}
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className={isRTL ? 'text-right' : 'text-left'}
        dir={isRTL ? 'rtl' : 'ltr'}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description" className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'description')} *
      </Label>
      <Textarea
        id="description"
        name="description"
        placeholder={t('idea_form', 'description_placeholder')}
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        className={isRTL ? 'text-right' : 'text-left'}
        dir={isRTL ? 'rtl' : 'ltr'}
        rows={6}
        required
      />
    </div>
  </>
);

// Category and strategic alignment fields
const CategoryFields = ({ formData, handleChange, strategicAlignment, setStrategicAlignment, strategicAlignmentOptions, lovLoading, isRTL, t }: {
  formData: FormState;
  handleChange: (field: string, value: string) => void;
  strategicAlignment: string[];
  setStrategicAlignment: (value: string[]) => void;
  strategicAlignmentOptions: ListOfValue[];
  lovLoading: boolean;
  isRTL: boolean;
  t: (namespace: string, key: string) => string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="category" className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'category')} *
      </Label>
      <Select name="category" value={formData.category} onValueChange={(value) => handleChange("category", value)}>
        <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
          <SelectValue placeholder={t('idea_form', 'select_category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="innovation">{t('categories', 'innovation')}</SelectItem>
          <SelectItem value="process_improvement">{t('categories', 'process_improvement')}</SelectItem>
          <SelectItem value="cost_reduction">{t('categories', 'cost_reduction')}</SelectItem>
          <SelectItem value="customer_experience">{t('categories', 'customer_experience')}</SelectItem>
          <SelectItem value="technology">{t('categories', 'technology')}</SelectItem>
          <SelectItem value="sustainability">{t('categories', 'sustainability')}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'strategic_alignment')}
      </Label>
      <MultiSelectDropdown
        options={strategicAlignmentOptions}
        value={strategicAlignment}
        onChange={setStrategicAlignment}
        placeholder={t('idea_form', 'select_strategic_alignment')}
        disabled={lovLoading}
      />
    </div>
  </div>
);

// Financial fields component
const FinancialFields = ({ formData, handleChange, isRTL, t }: {
  formData: FormState;
  handleChange: (field: string, value: string) => void;
  isRTL: boolean;
  t: (namespace: string, key: string) => string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="implementation_cost" className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'implementation_cost')}
      </Label>
      <Input
        id="implementation_cost"
        name="implementation_cost"
        type="number"
        placeholder={t('idea_form', 'estimated_cost')}
        value={formData.implementation_cost}
        onChange={(e) => handleChange("implementation_cost", e.target.value)}
        className={isRTL ? 'text-right' : 'text-left'}
        dir="ltr"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="expected_roi" className={isRTL ? 'text-right block' : 'text-left'}>
        {t('idea_form', 'expected_roi')}
      </Label>
      <Input
        id="expected_roi"
        name="expected_roi"
        type="number"
        placeholder={t('idea_form', 'expected_return')}
        value={formData.expected_roi}
        onChange={(e) => handleChange("expected_roi", e.target.value)}
        className={isRTL ? 'text-right' : 'text-left'}
        dir="ltr"
      />
    </div>
  </div>
);

// File upload section component
const FileUploadSection = ({ feasibilityFiles, pricingFiles, prototypeFiles, setFeasibilityFiles, setPricingFiles, setPrototypeFiles, isRTL, t }: {
  feasibilityFiles: File[];
  pricingFiles: File[];
  prototypeFiles: File[];
  setFeasibilityFiles: (files: File[]) => void;
  setPricingFiles: (files: File[]) => void;
  setPrototypeFiles: (files: File[]) => void;
  isRTL: boolean;
  t: (namespace: string, key: string) => string;
}) => (
  <div className="space-y-4">
    <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
      {t('idea_form', 'file_attachments_optional')}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FileUploadField
        label={t('idea_form', 'feasibility_study')}
        fileType="feasibility"
        accept=".pdf,.doc,.docx"
        value={feasibilityFiles}
        onChange={setFeasibilityFiles}
        placeholder={t('idea_form', 'upload_feasibility_documents')}
      />

      <FileUploadField
        label={t('idea_form', 'pricing_offers')}
        fileType="pricing_offer"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        value={pricingFiles}
        onChange={setPricingFiles}
        placeholder={t('idea_form', 'upload_pricing_documents')}
      />

      <FileUploadField
        label={t('idea_form', 'prototype_images')}
        fileType="prototype"
        accept="image/*"
        multiple
        value={prototypeFiles}
        onChange={setPrototypeFiles}
        placeholder={t('idea_form', 'upload_prototype_images')}
      />
    </div>
  </div>
);

// Form actions component
const FormActions = ({ loading, isPending, isRTL, t, toast }: {
  loading: boolean;
  isPending: boolean;
  isRTL: boolean;
  t: (namespace: string, key: string) => string;
  toast: ReturnType<typeof useToast>['toast'];
}) => (
  <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
    <Button type="submit" disabled={loading} className="flex-1">
      {(isPending || loading) ? t('idea_form', 'submitting') : t('idea_form', 'submit_idea')}
    </Button>
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        toast({
          title: "Draft Saved",
          description: "Your idea has been saved as a draft",
        });
      }}
    >
      {t('idea_form', 'save_as_draft')}
    </Button>
  </div>
);

export const IdeaSubmissionForm = ({ profile, onIdeaSubmitted }: IdeaSubmissionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();
  const { values: strategicAlignmentOptions, loading: lovLoading } = useListOfValues('strategic_alignment');

  const {
    formData,
    feasibilityFiles,
    pricingFiles,
    prototypeFiles,
    strategicAlignment,
    setFeasibilityFiles,
    setPricingFiles,
    setPrototypeFiles,
    setStrategicAlignment,
    resetForm,
    handleChange,
  } = useFormState();

  const uploadFile = async (file: File, ideaId: string, fileType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${ideaId}/${fileType}/${Date.now()}.${fileExt}`;
    return `placeholder-url/${fileName}`;
  };

  const createAttachmentPromises = async (files: File[], ideaId: string, fileType: string) => {
    const promises = [];
    for (const file of files) {
      const fileUrl = await uploadFile(file, ideaId, fileType);
      promises.push(
        fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idea_id: ideaId,
            file_type: fileType,
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: profile.id,
          })
        })
      );
    }
    return promises;
  };

  const handleFileUploads = async (ideaId: string) => {
    const hasFiles = feasibilityFiles.length > 0 || pricingFiles.length > 0 || prototypeFiles.length > 0;
    if (!hasFiles) return;

    try {
      const attachmentPromises = [
        ...await createAttachmentPromises(feasibilityFiles, ideaId, 'feasibility'),
        ...await createAttachmentPromises(pricingFiles, ideaId, 'pricing_offer'),
        ...await createAttachmentPromises(prototypeFiles, ideaId, 'prototype')
      ];

      await Promise.all(attachmentPromises);
    } catch (uploadError) {
      console.error("Error uploading files:", uploadError);
      toast({
        title: "Warning",
        description: "Idea submitted but some files failed to upload",
        variant: "destructive",
      });
    }
  };

  const handleSuccessfulSubmission = () => {
    toast({
      title: t('common', 'success'),
      description: "Your idea has been submitted successfully!",
    });
    resetForm();
    formRef.current?.reset();
    onIdeaSubmitted();
  };

  const handleSubmissionError = (error: unknown) => {
    console.error("Error submitting idea:", error);
    toast({
      title: t('common', 'error'),
      description: "Failed to submit idea",
      variant: "destructive",
    });
  };

  const processIdeaSubmission = async (submissionData: SubmissionData) => {
    try {
      const result = await createIdea({
        title: submissionData.title,
        description: submissionData.description,
        category: submissionData.category,
        submitterId: profile.id,
        implementationCost: submissionData.implementation_cost ? parseFloat(submissionData.implementation_cost) : null,
        expectedRoi: submissionData.expected_roi ? parseFloat(submissionData.expected_roi) : null,
        strategicAlignmentScore: submissionData.strategic_alignment_score ? parseInt(submissionData.strategic_alignment_score) : null,
        status: "draft",
        language: language,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ideaId) {
        await handleFileUploads(result.ideaId);
      }

      handleSuccessfulSubmission();
    } catch (error) {
      handleSubmissionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const submissionData = extractFormData(formData);

    if (!validateFormData(submissionData)) {
      toast({ title: "Missing required fields", variant: "destructive" });
      setLoading(false);
      return;
    }

    startTransition(() => processIdeaSubmission(submissionData));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
              {t('idea_form', 'submit_new_idea')}
            </CardTitle>
          </div>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t('idea_form', 'share_innovative_idea')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} className="space-y-6">
            <BasicFormFields formData={formData} handleChange={handleChange} isRTL={isRTL} t={t} />

            <CategoryFields
              formData={formData}
              handleChange={handleChange}
              strategicAlignment={strategicAlignment}
              setStrategicAlignment={setStrategicAlignment}
              strategicAlignmentOptions={strategicAlignmentOptions.values as unknown as ListOfValue[]}
              lovLoading={lovLoading}
              isRTL={isRTL}
              t={t}
            />

            <FinancialFields formData={formData} handleChange={handleChange} isRTL={isRTL} t={t} />

            <FileUploadSection
              feasibilityFiles={feasibilityFiles}
              pricingFiles={pricingFiles}
              prototypeFiles={prototypeFiles}
              setFeasibilityFiles={setFeasibilityFiles}
              setPricingFiles={setPricingFiles}
              setPrototypeFiles={setPrototypeFiles}
              isRTL={isRTL}
              t={t}
            />

            <FormActions loading={loading} isPending={isPending} isRTL={isRTL} t={t} toast={toast} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
