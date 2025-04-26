import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DocumentConfirmation() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/signature-view">
                  Documents
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/signature-prepare-1">
                  Prepare: Phase 1
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/signature-prepare-2">
                  Prepare: Phase 2
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Send</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">PDF Preview</h2>
              <div className="h-[calc(100vh-380px)] min-h-[450px] bg-muted/10 rounded-lg overflow-hidden">
                <div className="h-full p-8 space-y-6">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="grid grid-cols-2 gap-10 mt-10">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-20 bg-muted rounded w-full mt-6" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-20 bg-muted rounded w-full mt-6" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sender-name">Sender</Label>
                  <Input id="sender-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-confirmation">Confirmation via</Label>
                  <Input id="sender-confirmation" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient</Label>
                  <Input id="recipient-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-confirmation">
                    Confirmation via
                  </Label>
                  <Input id="recipient-confirmation" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 px-4">
          <Button
            size="lg"
            onClick={() => console.log("Send clicked")}
            className="w-full sm:w-auto bg-[#C2B59B] hover:bg-[#B3A68C]"
          >
            SEND
          </Button>
        </div>
      </footer>
    </div>
  );
}
