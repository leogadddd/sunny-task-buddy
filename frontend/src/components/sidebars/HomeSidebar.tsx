import { useSidebarStore } from "@/stores/sidebar.store";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Circle, Home, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CreateOrganization from "@/components/dialogs/CreateOrganization";
import EmptyBoxLight from "@/assets/images/empty-box-light.svg";
import EmptyBoxDark from "@/assets/images/empty-box-dark.svg";

const sampleOrganizations = [
  { id: "1", name: "Facebook" },
  { id: "2", name: "Creatia" },
];

export function HomeSidebarContent() {
  const { addSidebar, removeSidebar } = useSidebarStore();

  useEffect(() => {
    addSidebar({
      id: "home",
      icon: Home,
      title: "Home",
      sidebarComponent: <SidebarContent />,
    });
    return () => removeSidebar("home");
  }, []);

  return <></>;
}

function SidebarContent() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOrganizationCreate = (data: {
    name: string;
    description: string;
    members: string[];
  }) => {
    // TODO: Implement actual organization creation and update selectedValue
    console.log(`Organization created:`, data);
  };

  return (
    <>
      <div className="w-full">
        {/* Organization Picker */}
        <OrganizationPicker setDialogOpen={setDialogOpen} />

        {/* Projects List */}
        <ProjectsList />
      </div>
      {/* Dialogs */}
      <CreateOrganization
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleOrganizationCreate}
      />
    </>
  );
}

function ProjectsList() {
  const [isOpen, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  return (
    <>
      <div className="mt-4">
        <Button
          variant="ghost"
          size="xs"
          className="flex items-center w-full justify-start rounded-xs"
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
          <h2 className="text-sm text-foreground/80">Projects</h2>
        </Button>

        {isOpen && (
          <>
            <div>
              {projects.length <= 0 && (
                <div className="flex flex-col space-y-1 items-center justify-center h-full pt-24">
                  <img
                    src={EmptyBoxDark}
                    alt="Empty Projects List"
                    className="w-32 h-32 opacity-30"
                  />
                  <h3>You have no projects</h3>
                  <div className="text-sm text-foreground/40">
                    Create a project to get started
                  </div>
                  <div className="pt-8">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Create New Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function OrganizationPicker({
  setDialogOpen,
}: {
  setDialogOpen: (bool: boolean) => void;
}) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  );

  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCreateNewOrganization = () => {
    setDialogOpen(true);
    setPopoverOpen(false);
  };
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start font-bold text-md border-none bg-transparent hover:bg-background focus:ring-0"
        >
          {selectedValue || "Select an organization"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="p-1">
          <span className="text-xs text-foreground/80">
            Select an organization
          </span>
        </div>
        <div className="space-y-1">
          {sampleOrganizations.map((org) => (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setSelectedValue(org.name);
                setPopoverOpen(false);
              }}
            >
              <div className="flex flex-row justify-between w-full">
                <div className="flex flex-row items-center flex-1">
                  <Circle className="mr-3 w-3 h-3" />
                  {org.name}
                </div>
                <div>
                  {/* is selected */}
                  <span className="text-xs text-foreground/80">
                    {selectedValue === org.name ? "Selected" : ""}
                  </span>
                </div>
              </div>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleCreateNewOrganization}
          >
            <Plus className="mr-1 w-3 h-3" /> Create New Organization
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
