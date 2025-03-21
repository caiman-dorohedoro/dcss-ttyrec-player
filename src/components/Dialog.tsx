import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
};

const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  onCancel,
  onConfirm,
  cancelText = "취소",
  confirmText = "계속하기",
}: DialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {(onCancel || cancelText || onConfirm || confirmText) && (
          <AlertDialogFooter>
            {(onCancel || cancelText) && (
              <AlertDialogCancel
                className="hover:cursor-pointer"
                onClick={onCancel}
              >
                {cancelText}
              </AlertDialogCancel>
            )}
            {(onConfirm || confirmText) && (
              <AlertDialogAction
                className="hover:cursor-pointer"
                onClick={onConfirm}
              >
                {confirmText}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
