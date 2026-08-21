export type DialogType = 'alert' | 'confirm' | 'prompt';
export type DialogVariant = 'info' | 'success' | 'warning' | 'error';

export interface DialogOptions {
  id?: string;
  type: DialogType;
  variant?: DialogVariant;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

type DialogListener = (dialog: DialogOptions | null) => void;

class DialogManager {
  private listener: DialogListener | null = null;
  private currentDialog: DialogOptions | null = null;

  public subscribe(listener: DialogListener) {
    this.listener = listener;
    if (this.currentDialog) {
      listener(this.currentDialog);
    }
    return () => {
      this.listener = null;
    };
  }

  public alert(title: string, message: string, variant: DialogVariant = 'info', confirmText = 'Understood'): Promise<void> {
    return new Promise((resolve) => {
      this.currentDialog = {
        type: 'alert',
        variant,
        title,
        message,
        confirmText,
        onConfirm: () => {
          this.close();
          resolve();
        }
      };
      this.listener?.(this.currentDialog);
    });
  }

  public confirm(
    title: string,
    message: string,
    variant: DialogVariant = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentDialog = {
        type: 'confirm',
        variant,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          this.close();
          resolve(true);
        },
        onCancel: () => {
          this.close();
          resolve(false);
        }
      };
      this.listener?.(this.currentDialog);
    });
  }

  public prompt(
    title: string,
    message: string,
    defaultValue = '',
    placeholder = 'Enter value...',
    confirmText = 'Submit',
    cancelText = 'Cancel'
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this.currentDialog = {
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder,
        confirmText,
        cancelText,
        onConfirm: (val) => {
          this.close();
          resolve(val || '');
        },
        onCancel: () => {
          this.close();
          resolve(null);
        }
      };
      this.listener?.(this.currentDialog);
    });
  }

  public close() {
    this.currentDialog = null;
    this.listener?.(null);
  }
}

export const dialog = new DialogManager();
