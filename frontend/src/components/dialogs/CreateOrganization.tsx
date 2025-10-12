import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateOrganizationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: {
    name: string;
    description: string;
    members: string[];
  }) => void;
}

function CreateOrganization({
  open,
  onOpenChange,
  onCreate,
}: CreateOrganizationProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    }
  };

  const handlePrevious = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleAddMember = () => {
    if (memberEmail.trim() && !members.includes(memberEmail.trim())) {
      setMembers([...members, memberEmail.trim()]);
      setMemberEmail("");
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter((m) => m !== email));
  };

  const handleCreate = () => {
    if (name.trim()) {
      onCreate?.({
        name: name.trim(),
        description: description.trim(),
        members,
      });
      // TODO: Implement actual creation logic
      alert(`Creating organization: ${name}`);
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setName("");
    setDescription("");
    setMemberEmail("");
    setMembers([]);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create New Organization" : "Add Members"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the name and description for your new organization."
              : "Add members to your organization by email."}
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-left">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Organization name"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-left pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Organization description"
                rows={3}
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member" className="text-left">
                Email
              </Label>
              <Input
                id="member"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="col-span-2"
                placeholder="member@example.com"
                type="email"
              />
              <Button onClick={handleAddMember} size="sm">
                Add
              </Button>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-left pt-2">Members</Label>
              <div className="col-span-3 space-y-2">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members added yet.
                  </p>
                ) : (
                  members.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-muted p-2 rounded"
                    >
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(email)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {step === 1 && (
            <Button onClick={handleNext} disabled={!name.trim()}>
              Next
            </Button>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrganization;
