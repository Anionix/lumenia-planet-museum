// llm machine contract; claimIdentifier: ed4d2a7d-4345-5bdb-bddc-c88a6c943d9f
// executionIdentifier: evidenceExecutionIdentifier below; null means no character admitted.
// state: generated; transition: verified asset -> static studio availability. Do not hand-edit.
export type MuseumCharacterAvailability = { slug: string; ready: boolean; artifactIdentifier: string; imagePath: string | null; imageSha256: string | null; evidenceExecutionIdentifier: string | null };
export const museumCharacterAvailability: readonly MuseumCharacterAvailability[] = [
  {
    "slug": "william-morris",
    "ready": false,
    "artifactIdentifier": "8b952955-8da1-53ed-8cc0-87934f160bfa",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "alphonse-mucha",
    "ready": false,
    "artifactIdentifier": "e70e9a70-aeac-5cfd-8fef-6e48a863b007",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "charles-rennie-mackintosh",
    "ready": false,
    "artifactIdentifier": "ae1ebacf-03ec-540e-a785-44d641f962ce",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "piet-mondrian",
    "ready": false,
    "artifactIdentifier": "8908dfe6-9cef-58ac-8554-471a3a54334c",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "gerrit-rietveld",
    "ready": false,
    "artifactIdentifier": "2a500b24-3b56-5e31-93ca-7dc37ae1c375",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "ettore-sottsass",
    "ready": false,
    "artifactIdentifier": "9ee886df-010f-5ee6-b827-36f0ed8e3373",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "herbert-bayer",
    "ready": false,
    "artifactIdentifier": "f4c5d866-25c4-501e-94b6-0bf2153c1507",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "josef-muller-brockmann",
    "ready": false,
    "artifactIdentifier": "5b221fd1-2543-5ce3-9692-4f636bdcaf7e",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "massimo-vignelli",
    "ready": false,
    "artifactIdentifier": "0bd4c0e5-e01a-5b48-afa7-1cd5fef5115b",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "dieter-rams",
    "ready": false,
    "artifactIdentifier": "5ca94bad-edfc-57c5-9513-9c40b72b1ad5",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "naoto-fukasawa",
    "ready": false,
    "artifactIdentifier": "ec278ca2-55df-5242-aa70-ad22f632d4ee",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "rei-kawakubo",
    "ready": false,
    "artifactIdentifier": "6850b37f-485e-54cb-ad08-42652ff7baa6",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "charles-eames",
    "ready": false,
    "artifactIdentifier": "9d777939-20d5-5cbe-91c7-aa11e5542d8a",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "ray-eames",
    "ready": false,
    "artifactIdentifier": "73a7e14c-dcf4-5269-ae21-74376351e70c",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  },
  {
    "slug": "walter-gropius",
    "ready": false,
    "artifactIdentifier": "48532fb0-74b6-544e-b12e-12b412b9b392",
    "imagePath": null,
    "imageSha256": null,
    "evidenceExecutionIdentifier": null
  }
];
export const availableStudioSlugs = museumCharacterAvailability.filter(character => character.ready || character.slug === "william-morris").map(character => character.slug);
