"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select } from "antd";
import RichTextEditor from "../../../../components/RichTextEditor";

export const dynamic = 'force-dynamic';

export default function MediaEnvCreate() {
  const { formProps, saveButtonProps } = useForm({ resource: "media_environment" });

  const { selectProps: countrySelect } = useSelect({
    resource: "countries",
    optionLabel: "name_fr",
    optionValue: "id",
    sorters: [{ field: "name_fr", order: "asc" }],
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
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
    </Create>
  );
}
