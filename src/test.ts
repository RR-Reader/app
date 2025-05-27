type Status = "released" | "ongoing" | "canceled";
type SortOrder = "asc" | "desc";
type SortBy = "title" | "createdAt" | "status";

type ExampleType = {
  title: string;
  description: string;
  createdAt: Date;
  status: Status;
  tags: string[];
};

const exampleData: ExampleType[] = [
  {
    title: "Example Manga 1",
    description: "This is an example manga description.",
    createdAt: new Date("2023-01-01"),
    status: "released",
    tags: ["action", "adventure"],
  },
  {
    title: "Example Manga 2",
    description: "This is another example manga description.",
    createdAt: new Date("2023-02-01"),
    status: "ongoing",
    tags: ["fantasy", "romance"],
  },
  {
    title: "Example Manga 3",
    description: "This is yet another example manga description.",
    createdAt: new Date("2023-03-01"),
    status: "canceled",
    tags: ["horror", "mystery"],
  },
];

function filterExampleData(
  inputData: ExampleType[],
  limit?: number,
  searchTerm?: string,
  tagsFilter?: string[],
  statusFilter?: Status,
  sortBy?: "title" | "createAt" | "status",
  sortOrder: SortOrder = "asc",
): ExampleType[] {
  const filteredData = inputData.filter((item) => {
    const matchesSearchTerm =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTagsFilter =
      !tagsFilter || tagsFilter.every((tag) => item.tags.includes(tag));

    const matchesStatusFilter = !statusFilter || item.status === statusFilter;

    return matchesSearchTerm && matchesTagsFilter && matchesStatusFilter;
  });

  const sortedData = filteredData.sort((a, b) => {
    let comparison = 0;

    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "createAt") {
      comparison = a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return limit ? sortedData.slice(0, limit) : sortedData;
}

// Example usage
const searchTerm = "Example";
const tagsFilter = ["action"];
const statusFilter: "released" | "ongoing" | "canceled" = "ongoing";

const filteredData = filterExampleData(
  exampleData,
  4,
  undefined,
  undefined,
  undefined,
  "status",
  "desc",
);

console.log("Filtered Data:", filteredData);
