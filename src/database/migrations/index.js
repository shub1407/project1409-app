import { migration001 } from "./001_initial_splitbudget"
import { migration002 } from "./002_add_sync_support_splitbudget"
import { migration003 } from "./003_seed_default_categories"

export const migrations = [migration001, migration002, migration003]
