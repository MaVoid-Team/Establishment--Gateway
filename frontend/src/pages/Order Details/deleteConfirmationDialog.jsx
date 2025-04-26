import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  
  export default function DeleteConfirmationDialog({ isOpen, onClose, onConfirm }) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this order?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  
  