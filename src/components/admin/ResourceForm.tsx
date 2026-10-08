"use client";

import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";
import type { Rule } from "antd/es/form";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "password" | "country-select";
  rules?: Rule[];
  /** Pour "password" en édition: laisser vide = ne pas changer */
  optionalOnEdit?: boolean;
}

interface ResourceFormProps {
  resource: string;
  fields: FieldConfig[];
  mode: "create" | "edit";
}

// Form.Item clone son enfant et lui injecte value/onChange/id : ces props
// doivent impérativement être transmis au contrôle antd sous-jacent.
type ControlProps = Record<string, unknown>;

function CountrySelectField(props: ControlProps) {
  const { selectProps } = useSelect({
    resource: "countries",
    optionLabel: "name_fr",
    optionValue: "id",
  });
  return <Select {...selectProps} {...props} placeholder="Select a country" />;
}

function FieldInput({ field, ...controlProps }: { field: FieldConfig } & ControlProps) {
  switch (field.type) {
    case "textarea":
      return <Input.TextArea rows={4} {...controlProps} />;
    case "number":
      return <InputNumber style={{ width: "100%" }} {...controlProps} />;
    case "password":
      return <Input.Password autoComplete="new-password" {...controlProps} />;
    case "country-select":
      return <CountrySelectField {...controlProps} />;
    default:
      return <Input {...controlProps} />;
  }
}

export function ResourceForm({ resource, fields, mode }: ResourceFormProps) {
  const { formProps, saveButtonProps } = useForm({ resource, action: mode });
  const Wrapper = mode === "create" ? Create : Edit;

  return (
    <Wrapper resource={resource} saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={
              field.type === "password" && mode === "edit" && field.optionalOnEdit
                ? []
                : field.rules
            }
          >
            <FieldInput field={field} />
          </Form.Item>
        ))}
      </Form>
    </Wrapper>
  );
}
