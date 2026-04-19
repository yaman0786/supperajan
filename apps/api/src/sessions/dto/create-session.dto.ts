import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

const VALID_MODES = [
  'friendly', 'professional', 'playful', 'concise',
  'deep_research', 'companion', 'productivity', 'emotional_support',
] as const;

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsIn(VALID_MODES)
  assistantMode?: string;
}
