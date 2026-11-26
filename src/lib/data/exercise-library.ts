export type ExerciseDefinition = {
  name: string;
  muscleGroup: string;
  equipment: string;
};

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  { name: "Barbell back squat", muscleGroup: "Legs", equipment: "Barbell" },
  { name: "Romanian deadlift", muscleGroup: "Hamstrings", equipment: "Barbell" },
  { name: "Bench press", muscleGroup: "Chest", equipment: "Barbell" },
  { name: "Overhead press", muscleGroup: "Shoulders", equipment: "Barbell" },
  { name: "Barbell row", muscleGroup: "Back", equipment: "Barbell" },
  { name: "Pull-up", muscleGroup: "Back", equipment: "Bodyweight" },
  { name: "Push-up", muscleGroup: "Chest", equipment: "Bodyweight" },
  { name: "Dumbbell lunge", muscleGroup: "Legs", equipment: "Dumbbell" },
  { name: "Lat pulldown", muscleGroup: "Back", equipment: "Cable" },
  { name: "Leg press", muscleGroup: "Legs", equipment: "Machine" },
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight" },
  { name: "Cable triceps pushdown", muscleGroup: "Arms", equipment: "Cable" },
];