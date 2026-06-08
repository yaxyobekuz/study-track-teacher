// Utils
import { cn } from "@/shared/utils/cn";

// React
import { cloneElement, useRef, useState } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Ui components
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/shared/components/shadcn/dialog";
import { Drawer, DrawerContent } from "@/shared/components/shadcn/drawer";

const ModalWrapper = ({
  children,
  name = "",
  className = "",
  description = "",
  title = "Modal sarlavhasi",
}) => {
  const { closeModal, isOpen, data } = useModal(name);
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 480px)");

  // Ref orqali eng so'nggi loading qiymatini o'qiymiz, aks holda close
  // funksiyasi eski render closure'idagi (stale) isLoading'ni ko'rib qoladi.
  const isLoadingRef = useRef(false);
  const setLoading = (value) => {
    isLoadingRef.current = value;
    setIsLoading(value);
  };
  const hanldeCloseModal = (data) =>
    !isLoadingRef.current && closeModal(name, data);

  const body = cloneElement(children, {
    isLoading,
    setIsLoading: setLoading,
    close: hanldeCloseModal,
    ...(data || {}),
  });

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={hanldeCloseModal}>
        <DialogContent className={cn("max-w-md", className)}>
          {/* Header */}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {/* Body */}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={hanldeCloseModal}>
      <DrawerContent className={cn("px-5 pb-5", className)}>
        {/* Header */}
        <DialogHeader className="bg-white pb-3.5">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Body */}
        <div className="w-full max-h-[calc(100vh-154px)] overflow-y-auto hidden-scroll">
          {body}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ModalWrapper;
