"use client";

import RichTextEditor from "@/components/RichTextEditor";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select } from "antd";


export const dynamic = 'force-dynamic';

export default function MediaEnvEdit() {
  const { formProps, saveButtonProps } = useForm({
    resource: "media_environment",
    action: "edit",
    meta: { select: "*,countries(id,iso_a3,name_fr)" },
  });

  const { selectProps: countrySelect } = useSelect({
    resource: "countries",
    optionLabel: "name_fr",
    optionValue: "id",
    sorters: [{ field: "name_fr", order: "asc" }],
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Pays"
          name={["country_id"]}
          rules={[{ required: true }]}
        >
          <Select showSearch {...countrySelect} />
        </Form.Item>

        <Form.Item label="Cadre légal" name={["legal_environment"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Régulateurs" name={["media_regulators"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Associations" name={["journalists_associations"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Radio" name={["radio_stations"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="TV" name={["tv_stations"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Presse" name={["newspapers"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Médias en ligne" name={["online_media"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Liberté Internet" name={["internet_freedom"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>

        <Form.Item label="Principaux médias" name={["leading_media"]}>
          <RichTextEditor value={undefined} onChange={undefined} />
        </Form.Item>
      </Form>
    </Edit>
  );
}
