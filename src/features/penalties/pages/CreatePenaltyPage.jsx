// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { penaltiesAPI } from "@/shared/api/penalties.api";
import { usersAPI } from "@/shared/api/users.api";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Combobox from "@/shared/components/form/combobox";
import Button from "@/shared/components/form/button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const CreatePenaltyPage = () => {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    userId,
    categoryId,
    description,
    setField,
    setFields,
  } = useObjectState({
    userId: "",
    categoryId: "",
    description: "",
  });

  const [files, setFiles] = useState(null);

  // O'quvchilar ro'yxatini yuklash
  useEffect(() => {
    setStudentsLoading(true);
    usersAPI
      .getStudents({ limit: 500 })
      .then((res) => {
        const data = res.data.data || [];
        setStudents(
          data.map((s) => ({
            label: `${s.firstName}${s.lastName ? ` ${s.lastName}` : ""} (${s.username})`,
            value: s._id,
          })),
        );
      })
      .catch(() => toast.error("O'quvchilarni yuklashda xatolik"))
      .finally(() => setStudentsLoading(false));
  }, []);

  // Kategoriyalar yuklash (student role uchun)
  useEffect(() => {
    penaltiesAPI
      .getCategories({ targetRole: "student" })
      .then((res) => {
        setCategories(
          (res.data.data || []).map((c) => ({
            label: `${c.title} (${c.points} ball)`,
            value: c._id,
            points: c.points,
            title: c.title,
            description: c.description,
          })),
        );
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("categoryId", categoryId);

    if (description) formData.append("description", description);

    if (files) {
      for (const file of files) {
        formData.append("files", file);
      }
    }

    penaltiesAPI
      .create(formData)
      .then(() => {
        toast.success("Jarima yozildi. Owner tasdiqlashini kuting.");
        setFields({
          userId: "",
          categoryId: "",
          description: "",
        });
        setFiles(null);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <Card className="mb-4 !py-3">
        <h2 className="text-xl font-bold text-gray-900">Jarima yozish</h2>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <Combobox
            required
            label="O'quvchi"
            value={userId}
            isLoading={studentsLoading}
            placeholder="O'quvchini tanlang..."
            searchPlaceholder="Ism, username bo'yicha qidirish..."
            onChange={(v) => setField("userId", v)}
            options={students}
          />

          <Select
            required
            label="Kategoriya"
            value={categoryId}
            placeholder="Kategoriyani tanlang..."
            onChange={(v) => setField("categoryId", v)}
            options={categories}
          />

          <Input
            label="Izoh"
            type="textarea"
            value={description}
            onChange={(v) => setField("description", v)}
          />

          <Input
            label="Fayllar (rasm/video/pdf)"
            type="file"
            onChange={(filesList) => setFiles(filesList)}
            accept="image/*,video/mp4,video/webm,application/pdf"
            multiple
          />

          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !userId}
            className="px-6 text-sm font-medium"
          >
            {submitting ? "Yozilmoqda..." : "Jarima yozish"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreatePenaltyPage;
