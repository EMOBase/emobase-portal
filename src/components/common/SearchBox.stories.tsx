import { useEffect, useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { spyOn, userEvent, within } from "storybook/test";

import { searchNavigation } from "@/utils/searchNavigation";

import SearchBox from "./SearchBox";

const RESET_EVENT = "searchbox-story-reset";

function StorySearchBox(props: ComponentProps<typeof SearchBox>) {
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const handleReset = () => setResetKey((current) => current + 1);
    window.addEventListener(RESET_EVENT, handleReset);
    return () => window.removeEventListener(RESET_EVENT, handleReset);
  }, []);

  return <SearchBox key={resetKey} {...props} />;
}

const SUGGESTIONS = [
  "TC000001",
  "TC006123",
  "TC016177",
  "TC016178",
  "TC016179",
  "Tcas 5.2",
  "Tribolium castaneum",
  "GCA_000003055.4",
  "Drosophila melanogaster",
];

const SUGGEST_DELAY_MS = 800;

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify({ data, requestId: "storybook" }), {
    headers: { "Content-Type": "application/json" },
  });

const installSuggestMock = () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes("/public/versions")) {
      return jsonResponse([
        {
          id: 1,
          name: "storybook",
          isDefault: true,
          status: "READY",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ]);
    }

    if (!url.includes("/search/_suggest")) {
      return originalFetch(input, init);
    }

    const query = new URL(url, window.location.origin).searchParams
      .get("query")
      ?.toLowerCase()
      .trim();

    const matches = query
      ? SUGGESTIONS.filter((suggestion) =>
          suggestion.toLowerCase().includes(query),
        )
      : [];

    await sleep(SUGGEST_DELAY_MS);
    return jsonResponse(matches);
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
};

const meta = {
  title: "Common/SearchBox",
  component: SearchBox,
  render: (args) => <StorySearchBox {...args} />,
  decorators: [
    (Story) => (
      <div className="mx-auto min-h-[420px] w-full max-w-4xl p-8">
        <Story />
      </div>
    ),
  ],
  beforeEach: () => {
    const restoreFetch = installSuggestMock();
    const navigationSpy = spyOn(
      searchNavigation,
      "goToSearch",
    ).mockImplementation((term) => {
      window.alert(
        `This would navigate to the search page: /search/${encodeURIComponent(term)}`,
      );
      window.dispatchEvent(new Event(RESET_EVENT));
    });

    return () => {
      navigationSpy.mockRestore();
      restoreFetch();
    };
  },
  args: {
    variant: "hero",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["hero", "topbar"],
    },
  },
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  name: "Hero — empty",
};

export const Topbar: Story = {
  name: "Topbar — empty",
  args: {
    variant: "topbar",
  },
};

export const HeroWithSuggestions: Story = {
  name: "Hero — suggestions",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "TC0");
    await canvas.findByRole("listbox", {}, { timeout: 4000 });
  },
};

export const TopbarWithSuggestions: Story = {
  name: "Topbar — suggestions",
  args: {
    variant: "topbar",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "TC0");
    await canvas.findByRole("listbox", {}, { timeout: 4000 });
  },
};
