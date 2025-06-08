interface ExtensionWithStatus {
  id: string;
  name: string;
  description: string;
  version: string;
  language: string;
  content_rating: string;
  tags: string[];
  icon_url: string;
  source_url: string;
  download_url: string;
  isInstalled: boolean;
  installedVersion?: string;
  slug?: string;
}

interface ExtensionInstallProps {
  install: (entry: ExtensionWithStatus) => void;
  remove: (entry: ExtensionWithStatus) => void;
}

import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { CheckCircle, Download, Settings2, Trash2 } from "lucide-react";

export function ExtensionCard({
  entry,
  actions,
}: {
  entry: ExtensionWithStatus;
  actions: ExtensionInstallProps;
}) {
  return (
    <Card
      key={entry.id}
      className={cn(
        "relative rounded-none",
        entry.isInstalled &&
          "bg-green-50/50 ring ring-green-400/20 dark:bg-green-950/20",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <img
              src={entry.icon_url || undefined}
              className="size-6"
              alt={`${entry.name} icon`}
            />
            <CardTitle className="text-base">{entry.name}</CardTitle>
            {entry.isInstalled && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="size-3" />
                Installed
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline">{entry.version}</Badge>
            {entry.isInstalled && entry.installedVersion !== entry.version && (
              <Badge variant="secondary" className="text-xs">
                v{entry.installedVersion}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          {entry.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="-mt-4 mb-2 flex flex-wrap items-center gap-1">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-muted-foreground grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
          <p>
            <strong className="text-black dark:text-white">Language:</strong>{" "}
            {entry.language}
          </p>
          <p>
            <strong className="text-black dark:text-white">
              Content Rating:
            </strong>{" "}
            {entry.content_rating}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-row justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => open(entry.source_url)}
        >
          <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {entry.isInstalled ? (
            <>
              <Button size="icon" variant="secondary" className="size-8">
                <Settings2 />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => actions.remove(entry)}
              >
                <Trash2 />
                Remove
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => actions.install(entry)}>
              <Download />
              Install
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
