export const DEFAULT_SOURCE = `/**
 * Custom Block Template
 *
 * AVAILABLE RESOURCES:
 * - All shadcn/ui components (Input, Label, Button, Card, etc.)
 * - All Lucide React icons
 * - Theme system for consistent styling
 * - Validation utilities
 * - Type definitions
 *
 * OTHER AVAILABLE PACKAGES:
 * - uuid: import { v4 as uuidv4 } from "uuid";
 * - date-fns: import { format, addDays } from "date-fns";
 * - framer-motion (for animations)
 */

import React, { forwardRef } from "react";
import type {
  BlockDefinition,
  ContentBlockItemProps,
  BlockRendererProps,
  BlockData,
  ThemeDefinition,
} from "@/packages/survey-form-package/src/types";
import { Input } from "@/packages/survey-form-package/src/components/ui/input";
import { Label } from "@/packages/survey-form-package/src/components/ui/label";
import { Button } from "@/packages/survey-form-package/src/components/ui/button";
import { Card } from "@/packages/survey-form-package/src/components/ui/card";
import { Type, CirclePlus, CircleX } from "lucide-react";
import { cn } from "@/packages/survey-form-package/src/lib/utils";
import { themes } from "@/packages/survey-form-package/src/themes";
import { useSurveyForm } from "@/packages/survey-form-package/src/context/SurveyFormContext";

const CustomBlockForm: React.FC<ContentBlockItemProps> = ({ data, onUpdate }) => {
  const handleUpdate = (field: string, value: any) => {
    onUpdate?.({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fieldName">Field Name *</Label>
        <Input
          id="fieldName"
          value={data.fieldName || ""}
          onChange={(e) => handleUpdate("fieldName", e.target.value)}
          placeholder="customField"
        />
        <p className="text-xs text-muted-foreground">
          Unique identifier for storing responses
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="label">Label *</Label>
        <Input
          id="label"
          value={data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="Enter your response"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder</Label>
        <Input
          id="placeholder"
          value={data.placeholder || ""}
          onChange={(e) => handleUpdate("placeholder", e.target.value)}
          placeholder="Type here..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description/Help Text</Label>
        <Input
          id="description"
          value={data.description || ""}
          onChange={(e) => handleUpdate("description", e.target.value)}
          placeholder="Additional instructions"
        />
      </div>
    </div>
  );
};

const CustomBlockItem: React.FC<ContentBlockItemProps> = ({ data }) => {
  return (
    <Card className="space-y-2 p-4">
      {data.label && <Label>{data.label}</Label>}
      {data.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}
      <Input disabled placeholder={data.placeholder || "Preview"} />
    </Card>
  );
};

const CustomBlockPreview: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center py-1">
      <div className="w-4/5 border rounded-md p-2 text-xs text-muted-foreground bg-muted/30">
        Custom Input
      </div>
    </div>
  );
};

const CustomBlockRenderer = forwardRef<HTMLInputElement, BlockRendererProps>(
  ({ block, value, onChange, onBlur, error, disabled, theme }, ref) => {
    const { goToNextBlock, setValue, navigationHistory } = useSurveyForm();
    const themeConfig = theme ?? themes.default;

    return (
      <div className="w-full min-w-0">
        {block.label && (
          <Label
            htmlFor={block.fieldName}
            className={cn("mb-2 block", themeConfig.field.label)}
          >
            {block.label}
          </Label>
        )}

        {block.description && (
          <div className={cn("text-sm mb-2", themeConfig.field.description)}>
            {block.description}
          </div>
        )}

        <Input
          id={block.fieldName}
          ref={ref}
          type="text"
          name={block.fieldName}
          placeholder={block.placeholder}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "transition-colors",
            error && "border-destructive",
            themeConfig.field.input
          )}
          aria-invalid={!!error}
        />

        {error && (
          <div className={cn("text-sm font-medium mt-1", themeConfig.field.error)}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

CustomBlockRenderer.displayName = "CustomBlockRenderer";

export const CustomBlock: BlockDefinition = {
  type: "customBlock",
  name: "Custom Block",
  description: "A custom input block",
  icon: <Type className="w-4 h-4" />,
  defaultData: {
    type: "customBlock",
    fieldName: "customField",
    label: "Custom Field",
    placeholder: "Enter value...",
    description: "",
    required: false,
    showContinueButton: false,
    autoContinueOnSelect: false,
    isEndBlock: false,
  },
  generateDefaultData: () => ({
    type: "customBlock",
    fieldName: \`customField_\${Date.now()}\`,
    label: "Custom Field",
    placeholder: "Enter value...",
    description: "",
    required: false,
    showContinueButton: false,
    autoContinueOnSelect: false,
    isEndBlock: false,
  }),
  renderItem: (props) => <CustomBlockItem {...props} />,
  renderFormFields: (props) => <CustomBlockForm {...props} />,
  renderPreview: () => <CustomBlockPreview />,
  renderBlock: (props) => <CustomBlockRenderer {...props} />,
  validate: (data: BlockData) => {
    if (!data.fieldName) return "Field name is required";
    if (!data.label) return "Label is required";
    return null;
  },
  validateValue: (value: any, data: BlockData) => {
    if (data.required && !value) {
      return \`\${data.label || "This field"} is required\`;
    }
    return null;
  },
};`;
