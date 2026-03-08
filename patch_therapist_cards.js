const fs = require('fs');

let c = fs.readFileSync('app/(app)/therapist/index.tsx', 'utf8');

c = c.replace(
    /<PressableScale style=\{\{ flex: 1 \}\} onPress=\{() => router.push\('\/\(app\)\/therapist\/templates'\)\}>/g,
    '<View style={{ flex: 1, display: "flex", minWidth: 0 }}><PressableScale style={{ flex: 1, width: "100%" }} onPress={() => router.push(\'/(app)/therapist/templates\')}>'
);

c = c.replace(
    /<Text style=\{\{ color: colors.textSubtle, fontWeight: '600', fontSize: 13, lineHeight: 18 \}\}>\s*Übungsvorlagen erstellen und verwalten\s*<\/Text>\s*<\/Card>\s*<\/PressableScale>/g,
    '<Text style={{ color: colors.textSubtle, fontWeight: \'600\', fontSize: 13, lineHeight: 18 }}>\n                                    Übungsvorlagen erstellen und verwalten\n                                </Text>\n                            </Card>\n                        </PressableScale>\n                        </View>'
);

c = c.replace(
    /<PressableScale style=\{\{ flex: 1 \}\} onPress=\{() => router.push\('\/\(app\)\/therapist\/resources'\)\}>/g,
    '<View style={{ flex: 1, display: "flex", minWidth: 0 }}><PressableScale style={{ flex: 1, width: "100%" }} onPress={() => router.push(\'/(app)/therapist/resources\')}>'
);

c = c.replace(
    /<Text style=\{\{ color: colors.textSubtle, fontWeight: '600', fontSize: 13, lineHeight: 18 \}\}>\s*Gemeinsames Material und Dokumente\s*<\/Text>\s*<\/Card>\s*<\/PressableScale>/g,
    '<Text style={{ color: colors.textSubtle, fontWeight: \'600\', fontSize: 13, lineHeight: 18 }}>\n                                    Gemeinsames Material und Dokumente\n                                </Text>\n                            </Card>\n                        </PressableScale>\n                        </View>'
);

fs.writeFileSync('app/(app)/therapist/index.tsx', c);
console.log('Fixed wrapper views');
