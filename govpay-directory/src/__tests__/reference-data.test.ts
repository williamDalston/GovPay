import { describe, it, expect } from "vitest";
import {
  GS_BASE_PAY_2025,
  GS_GRADES,
  GS_STEPS,
  LOCALITY_AREAS,
  US_STATES,
} from "@/lib/reference-data";

describe("GS_BASE_PAY_2025", () => {
  it("has all 15 grades", () => {
    expect(Object.keys(GS_BASE_PAY_2025)).toHaveLength(15);
  });

  it("each grade has 10 steps", () => {
    for (const grade of GS_GRADES) {
      expect(GS_BASE_PAY_2025[grade]).toHaveLength(10);
    }
  });

  it("steps are monotonically increasing within each grade", () => {
    for (const grade of GS_GRADES) {
      const steps = GS_BASE_PAY_2025[grade];
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i]).toBeGreaterThanOrEqual(steps[i - 1]);
      }
    }
  });

  it("higher grades have higher step 1 pay", () => {
    for (let g = 2; g <= 15; g++) {
      expect(GS_BASE_PAY_2025[g][0]).toBeGreaterThan(
        GS_BASE_PAY_2025[g - 1][0]
      );
    }
  });
});

describe("GS_GRADES and GS_STEPS", () => {
  it("grades go from 1 to 15", () => {
    expect(GS_GRADES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it("steps go from 1 to 10", () => {
    expect(GS_STEPS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe("LOCALITY_AREAS", () => {
  it("has Rest of US as the first entry", () => {
    expect(LOCALITY_AREAS[0].area).toBe("Rest of US");
    expect(LOCALITY_AREAS[0].adjustment).toBe(1.0);
  });

  it("all adjustments are >= 1.0", () => {
    for (const area of LOCALITY_AREAS) {
      expect(area.adjustment).toBeGreaterThanOrEqual(1.0);
    }
  });

  it("all slugs are unique", () => {
    const slugs = LOCALITY_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("US_STATES", () => {
  it("has 51 entries (50 states + DC)", () => {
    expect(US_STATES.length).toBe(51);
  });

  it("all abbreviations are 2 uppercase characters", () => {
    for (const state of US_STATES) {
      expect(state.abbreviation).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("all slugs are lowercase kebab-case", () => {
    for (const state of US_STATES) {
      expect(state.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it("includes DC", () => {
    const dc = US_STATES.find((s) => s.abbreviation === "DC");
    expect(dc).toBeDefined();
    expect(dc!.name).toBe("District of Columbia");
  });
});
